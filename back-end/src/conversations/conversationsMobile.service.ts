import { Brackets, In, MoreThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import {
  ConversationTopicDto,
  MessageConversationDto,
} from 'interfaces/message.dto';
import { Conversation } from 'entities/conversations';
import { Topic } from 'entities/topics';
import { ROLES, TOPIC_STATUS } from 'helpers/enums';
import { User } from 'entities/user';

@Injectable()
export class ConversationMobileService {
  // injecting a Repository of type Message
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  paginator(items: Topic[], current_page: number, per_page_items: number) {
    // eslint-disable-next-line prefer-const
    const page = current_page || 1,
      // eslint-disable-next-line prefer-const
      per_page = per_page_items || 10,
      // eslint-disable-next-line prefer-const
      offset = (page - 1) * per_page,
      paginatedItems = items.slice(offset).slice(0, per_page_items);

    return paginatedItems;
  }
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

  /**
   * It returns a list of topics with the number of unread messages for each topic
   * @param {number} me - number - The id of the user who is logged in.
   * @returns An array of topics with the unread messages count.
   */
  async getTopics(
    me: number,
    pageCurrent: number,
    pageSize: number,
    valueDate: string,
    valueId: string,
  ) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.entity', 'entity')
      .leftJoinAndSelect('user.team', 'team')
      .leftJoinAndSelect('user.departements', 'departements')
      .where('user.id = :id', { id: me })
      .getOne();

    let topics: Topic[];

    if (valueId === '' && valueDate === '1970-01-01') {
      if (user.role === ROLES.ChefEntity) {
        topics = await this.topicRepository.find({
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
        return {
          topics: this.paginator(
            topicsWithUnreadMessages,
            pageCurrent,
            pageSize,
          ),
          topicsall: topicsWithUnreadMessages,
          totalTopic: topics.length,
        };
      }
      if (user.role === ROLES.TeamLeader) {
        const topics = await this.getTeamLeaderTopics(user);
        const topicsWithUnreadMessages = await this.getTopicsWithUnreadMessages(
          topics,
          me,
        );
        return {
          topics: this.paginator(
            topicsWithUnreadMessages,
            pageCurrent,
            pageSize,
          ),
          topicsall: topicsWithUnreadMessages,
          totalTopic: topics.length,
        };
      }
      topics = await this.topicRepository.find({
        where: [
          {
            createdAt: MoreThan(valueDate) as unknown as Date,
            from: {
              id: me,
            },
          },
          {
            createdAt: MoreThan(valueDate) as unknown as Date,
            to: {
              id: me,
            },
          },
        ],
        order: {
          updatedAt: 'ASC',
        },
        relations: ['from', 'to', 'updatedby'],
      });
    } else if (valueId) {
      if (user.role === ROLES.ChefEntity) {
        topics = await this.topicRepository.find({
          where: [
            {
              id: +valueId,
              from: {
                id: me,
              },
            },
            {
              id: +valueId,
              to: {
                id: me,
              },
            },
            {
              id: +valueId,
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
              id: +valueId,
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
        return {
          topics: this.paginator(
            topicsWithUnreadMessages,
            pageCurrent,
            pageSize,
          ),
          topicsall: topics,
          totalTopic: topics.length,
        };
      }
      if (user.role === ROLES.TeamLeader) {
        const topics = await this.getTeamLeaderTopics(user);
        const topicsWithUnreadMessages = await this.getTopicsWithUnreadMessages(
          topics,
          me,
        );
        return {
          topics: this.paginator(
            topicsWithUnreadMessages,
            pageCurrent,
            pageSize,
          ),
          topicsall: topicsWithUnreadMessages,
          totalTopic: topics.length,
        };
      }
      topics = await this.topicRepository.find({
        where: [
          {
            id: +valueId,
            from: {
              id: me,
            },
          },
          {
            id: +valueId,
            to: {
              id: me,
            },
          },
        ],
        order: {
          updatedAt: 'DESC',
        },
        relations: ['from', 'to', 'updatedby'],
      });
    } else if (valueDate !== '1970-01-01') {
      if (user.role === ROLES.ChefEntity) {
        topics = await this.topicRepository.find({
          where: [
            {
              createdAt: MoreThan(valueDate) as unknown as Date,
              from: {
                id: me,
              },
            },
            {
              createdAt: MoreThan(valueDate) as unknown as Date,
              to: {
                id: me,
              },
            },
            {
              createdAt: MoreThan(valueDate) as unknown as Date,
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
              createdAt: MoreThan(valueDate) as unknown as Date,
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
            updatedAt: 'ASC',
          },
          relations: ['from', 'to', 'updatedby', 'from.entity', 'to.entity'],
        });

        const topicsWithUnreadMessages = await Promise.all(
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

        return {
          topics: this.paginator(
            topicsWithUnreadMessages,
            pageCurrent,
            pageSize,
          ),
          topicsall: topics,
          totalTopic: topics.length,
        };
      }
      if (user.role === ROLES.TeamLeader) {
        const topics = await this.getTeamLeaderTopics(user);
        const topicsWithUnreadMessages = await this.getTopicsWithUnreadMessages(
          topics,
          me,
        );
        return {
          topics: this.paginator(
            topicsWithUnreadMessages,
            pageCurrent,
            pageSize,
          ),
          topicsall: topicsWithUnreadMessages,
          totalTopic: topics.length,
        };
      }
      topics = await this.topicRepository.find({
        where: [
          {
            createdAt: MoreThan(valueDate) as unknown as Date,
            from: {
              id: me,
            },
          },
          {
            createdAt: MoreThan(valueDate) as unknown as Date,
            to: {
              id: me,
            },
          },
        ],
        order: {
          updatedAt: 'ASC',
        },
        relations: ['from', 'to', 'updatedby'],
      });
    }
    const topicsWithUnreadMessages = await this.getTopicsWithUnreadMessages(
      topics,
      me,
    );

    return {
      topics: this.paginator(topicsWithUnreadMessages, pageCurrent, pageSize),
      topicsall: topics,
      totalTopic: topics.length,
    };
  }

  async getAllConversations() {
    return await this.conversationRepository.find({
      relations: ['from', 'to'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async getAllTopics(
    pageCurrent: number,
    pageSize: number,
    valueDate: string,
    valueId: string,
  ) {
    let topics;

    if (valueId === '' && valueDate === '1970-01-01') {
      topics = await this.topicRepository
        .createQueryBuilder('topic')
        .leftJoinAndSelect('topic.from', 'from')
        .leftJoinAndSelect('topic.to', 'to')
        .getMany();
    } else if (valueId) {
      topics = await this.topicRepository
        .createQueryBuilder('topic')
        .leftJoinAndSelect('topic.from', 'from')
        .leftJoinAndSelect('topic.to', 'to')
        .where('topic.id =:id', { id: valueId })
        .getMany();
    } else if (valueDate !== '1970-01-01') {
      topics = await this.topicRepository
        .createQueryBuilder('topic')
        .leftJoinAndSelect('topic.from', 'from')
        .leftJoinAndSelect('topic.to', 'to')
        .where('topic.createdAt >= :createdAt', {
          createdAt: valueDate,
        })
        .orderBy('topic.updatedAt', 'ASC')
        .getMany();
    }
    return {
      topics: this.paginator(topics, pageCurrent, pageSize),
      totalTopic: topics.length,
    };
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

  async getTopicsCount(me: number) {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.entity', 'entity')
      .leftJoinAndSelect('user.departements', 'departements')
      .where('user.id = :id', { id: me })
      .getOne();

    let topics: Topic[];

    if (user.role === ROLES.ChefEntity) {
      topics = await this.topicRepository.find({
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

      const topicsOpen = topics.filter(
        (top) => top.status === TOPIC_STATUS.OPEN,
      ).length;
      const topicsComplete = topics.filter(
        (top) => top.status === TOPIC_STATUS.COMPLETED,
      ).length;

      return {
        totalOpen: topicsOpen,
        totalComplete: topicsComplete,
      };
    }

    topics = await this.topicRepository
      .createQueryBuilder('topic')
      .leftJoinAndSelect('topic.from', 'from')
      .leftJoinAndSelect('topic.to', 'to')
      .where(
        new Brackets((qb) => {
          qb.where('from.id = :id', { id: me }).orWhere(' to.id = :id', {
            id: me,
          });
        }),
      )
      .orderBy('topic.updatedAt', 'DESC')
      .getMany();

    const topicsOpen = topics.filter(
      (top) => top.status === TOPIC_STATUS.OPEN,
    ).length;
    const topicsComplete = topics.filter(
      (top) => top.status === TOPIC_STATUS.COMPLETED,
    ).length;

    return {
      totalOpen: topicsOpen,
      totalComplete: topicsComplete,
    };
  }

  async getTopicsCountAdmin() {
    const totalOpen = await this.topicRepository
      .createQueryBuilder('topic')
      .where('topic.status = :status', { status: TOPIC_STATUS.OPEN })
      .getCount();

    const totalComplete = await this.topicRepository
      .createQueryBuilder('topic')
      .where('topic.status = :status', { status: TOPIC_STATUS.COMPLETED })
      .getCount();

    return {
      totalOpen: totalOpen,
      totalComplete: totalComplete,
    };
  }
}
