import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  ConversationTopicDto,
  MessageConversationDto,
} from 'interfaces/message.dto';
import { Conversation } from 'entities/conversations';
import { Topic } from 'entities/topics';
import { ROLES, TOPIC_STATUS } from 'helpers/enums';
import { User } from 'entities/user';

@Injectable()
export class ConversationService {
  // injecting a Repository of type Message
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async insert(messageData: MessageConversationDto) {
    const message = await this.conversationRepository.save(messageData);
    return await this.conversationRepository.findOne({
      where: {
        id: message.id,
      },
      relations: ['from', 'to'],
    });
  }

  async insertTopic(topicDto: ConversationTopicDto) {
    await this.topicRepository.save(topicDto);
  }

  async updateTopicStatus(
    topic: number,
    status: TOPIC_STATUS,
    updatedby: number,
  ) {
    return await this.topicRepository.update(
      {
        id: topic,
      },
      {
        status,
        updatedby: {
          id: updatedby,
        },
      },
    );
  }

  getTopicsWithUnreadMessages = async (topics: Topic[], me: number) => {
    return await Promise.all(
      topics.map(async (topic) => {
        const unReadMessagesCount = await this.conversationRepository
          .createQueryBuilder('message')
          .where('NOT (:id = ANY (message.read))', { id: me })
          .andWhere('message.topicId = :topic', {
            topic: topic.id,
          })
          .getCount();
        return {
          ...topic,
          unreadMessages: unReadMessagesCount,
        };
      }),
    );
  };

  /**
   * It returns a list of topics with the number of unread messages for each topic
   * @param {number} me - number - The id of the user who is logged in.
   * @returns An array of topics with the unread messages count.
   */
  async getTopics(me: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: me,
      },
      relations: ['entity', 'team', 'departements'],
    });
    if (user.role === ROLES.ChefEntity) {
      const topics = await this.topicRepository.find({
        where: [
          {
            from: {
              id: me,
            },
          },
          {
            to: {
              id: me,
            },
          },
          {
            from: {
              entity: {
                id: user.entity.id,
              },
              departements: {
                id: In(user.departements.map((dp) => dp.id)),
              },
            },
          },
          {
            to: {
              entity: {
                id: user.entity.id,
              },
              departements: {
                id: In(user.departements.map((dp) => dp.id)),
              },
            },
          },
        ],
        order: {
          updatedAt: 'DESC',
        },
        relations: ['from', 'to', 'updatedby', 'from.entity', 'to.entity'],
      });
      const topicsWithUnreadMessages = await this.getTopicsWithUnreadMessages(
        topics,
        me,
      );
      return topicsWithUnreadMessages;
    }
    if (user.role === ROLES.TeamLeader) {
      const topics = await this.getTeamLeaderTopics(user);
      const topicsWithUnreadMessages = await this.getTopicsWithUnreadMessages(
        topics,
        me,
      );
      return topicsWithUnreadMessages;
    }
    const topics = await this.topicRepository.find({
      where: [
        {
          from: {
            id: me,
          },
        },
        {
          to: {
            id: me,
          },
        },
      ],
      order: {
        updatedAt: 'DESC',
      },
      relations: ['from', 'to', 'updatedby', 'from.entity', 'to.entity'],
    });
    const topicsWithUnreadMessages = await this.getTopicsWithUnreadMessages(
      topics,
      me,
    );
    return topicsWithUnreadMessages;
  }

  async getAllConversations() {
    return await this.conversationRepository.find({
      relations: ['from', 'to'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getAllTopics() {
    return await this.topicRepository.find({
      relations: ['from', 'to'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  /**
   * It returns all the conversations between two users, ordered by the time they were created
   * @param {number} me - number, to: number
   * @param {number} user - number - The user id of the user you want to get the conversations from.
   * @returns An array of conversations
   */
  async findAll(me: number, topicId: number) {
    await this.conversationRepository.query(
      `UPDATE conversations SET read = read || ${Number(me)}
        WHERE conversations."topicId" = ${Number(topicId)}  AND NOT (${Number(
        me,
      )} = ANY (read))`,
    );
    return await this.conversationRepository.find({
      where: {
        topic: {
          id: topicId,
        },
      },
      relations: ['from', 'to', 'topic'],
      order: {
        createdAt: 'ASC',
      },
    });
  }

  /**
   * It returns all the users that have chatted with the user with the id of `me` and the number of
   * unread messages from each user
   * @param {number} me - number - the id of the user who is currently logged in
   * @returns An array of objects with the following properties:
   *   id: number
   *   username: string
   *   unreadMessages: number
   */
  async findAllChat(me: number) {
    const conversations = await this.conversationRepository
      .createQueryBuilder('conv')
      .innerJoinAndSelect('conv.from', 'from')
      .innerJoinAndSelect('conv.to', 'to')
      .where('(conv.from = :me OR conv.to = :me)', { me })
      .distinctOn(['conv.from', 'conv.to'])
      .getMany();

    const usersList = conversations.map((chat) => [chat.from, chat.to]).flat();
    const ids = usersList.map((user) => user.id);
    /* remove duplicates user objects from usersList array
    remove duplicates objects from array javascript in general */
    const filtered = usersList.filter(
      ({ id }, index) => !ids.includes(id, index + 1),
    );
    /* Filtering out the user who is currently logged in from the list of users. */
    const users = filtered.filter((user) => user.id !== Number(me));
    const usersWithUnreadMessages = await Promise.all(
      users.map(async (user) => {
        const unReadMessagesCount = await this.conversationRepository
          .createQueryBuilder('message')
          .where('NOT (:id = ANY (message.read))', { id: me })
          .andWhere('message.fromId = :from AND message.toId=:me', {
            from: user.id,
            me,
          })
          .getCount();
        return {
          ...user,
          unreadMessages: unReadMessagesCount,
        };
      }),
    );
    return usersWithUnreadMessages;
  }

  async findAllUnreadMessages(me: number) {
    const unReadMessagesCount = await this.conversationRepository
      .createQueryBuilder('message')
      .where('NOT (:id = ANY (message.read))', { id: me })
      .andWhere('message.toId=:me', {
        me,
      })
      .getCount();
    return unReadMessagesCount;
  }

  async updateConversation(conv: Conversation) {
    await this.conversationRepository.update(conv.id, {
      ...conv,
    });
  }

  async getTeamLeaderTopics(user: User) {
    return await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.from', 'from')
      .leftJoinAndSelect('topic.to', 'to')
      .leftJoinAndSelect('topic.updatedby', 'updatedby')
      .leftJoinAndSelect('from.entity', 'fromEntity')
      .leftJoinAndSelect('to.entity', 'toEntity')
      .leftJoinAndSelect('from.departements', 'fromDepartements')
      .leftJoinAndSelect('to.departements', 'toDepartements')
      .where('(from.id = :me OR to.id = :me)', { me: user.id })
      .orWhere(
        '(from.access_team && :accessTeams AND fromDepartements.id IN (:...departmentIds))',
        {
          accessTeams: user.access_team,
          departmentIds: user.departements.map((dp) => dp.id),
        },
      )
      .orWhere(
        '(to.access_team && :accessTeams AND toDepartements.id IN (:...departmentIds))',
        {
          accessTeams: user.access_team,
          departmentIds: user.departements.map((dp) => dp.id),
        },
      )
      .orderBy('topic.updatedAt', 'DESC')
      .getMany();
  }

  async getTopicByUserID(me: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id: me,
        },
        relations: ['entity', 'team', 'departements'],
      });
      if (user.role === ROLES.ChefEntity) {
        const topics = await this.topicRepository.find({
          where: [
            {
              from: {
                id: me,
              },
            },
            {
              to: {
                id: me,
              },
            },
            {
              from: {
                entity: {
                  id: user.entity.id,
                },
                departements: {
                  id: In(user.departements.map((dp) => dp.id)),
                },
              },
            },
            {
              to: {
                entity: {
                  id: user.entity.id,
                },
                departements: {
                  id: In(user.departements.map((dp) => dp.id)),
                },
              },
            },
          ],
          order: {
            updatedAt: 'DESC',
          },
          relations: ['from', 'to', 'updatedby', 'from.entity', 'to.entity'],
        });
        return topics;
      }
      if (user.role === ROLES.TeamLeader) {
        const topics = await this.getTeamLeaderTopics(user);
        const topicsWithUnreadMessages = await this.getTopicsWithUnreadMessages(
          topics,
          me,
        );
        return topicsWithUnreadMessages;
      }
      const topics = await this.topicRepository.find({
        where: [
          {
            from: {
              id: me,
            },
          },
          {
            to: {
              id: me,
            },
          },
        ],
        order: {
          updatedAt: 'DESC',
        },
        relations: ['from', 'to', 'updatedby', 'from.entity', 'to.entity'],
      });
      const topicsWithUnreadMessages = await this.getTopicsWithUnreadMessages(
        topics,
        me,
      );
      return topicsWithUnreadMessages;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }
  // search in messages ?
  async search(me: number, msg: string) {
    // get topics
    try {
      const topics = await this.getTopicByUserID(me);
      const topicId = topics.map((tic) => tic.id);
      const message = await this.conversationRepository
        .createQueryBuilder('conversation')
        .leftJoinAndSelect('conversation.topic', 'topic')
        .leftJoinAndSelect('topic.from', 'from')
        .leftJoinAndSelect('topic.to', 'to')
        .where('conversation.msg ILIKE :msg', { msg: `%${msg}%` })
        .andWhere('topic.id IN (:...topicId)', { topicId: topicId })
        .distinctOn(['conversation.topic'])
        .getMany();

      const result = message.map((el) => el.topic);
      console.log(result);

      return result;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }
}
