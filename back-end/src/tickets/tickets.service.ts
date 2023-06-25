import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Injectable } from '@nestjs/common';
import { Ticket } from 'entities/tickets';
import { TicketDto, UpdateTicketDto } from 'interfaces/ticket.dto';
import { IqueryParams, META_TYPE, TICKET_STATUS } from '../helpers/enums';
import { Message } from 'entities/messages';
import { User } from 'entities/user';
import dayjs from 'dayjs';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket) private ticketsRepository: Repository<Ticket>,
    @InjectRepository(Message) private messagesRepository: Repository<Message>,
  ) {}

  /* The  code is a function that is executed every 2 hours using a cron job. It
 retrieves all non-archived tickets from a database table, orders them by their updatedAt timestamp
 in ascending order, and selects only their id and updatedAt fields. It then loops through each
 ticket and checks if it has been updated more than 2 months ago using the dayjs library. If a
 ticket has not been updated in more than 2 months, it is marked as archived in the database by
 updating its archived field to true. */
  @Cron(CronExpression.EVERY_2_HOURS)
  async handleCron() {
    const tickets = await this.ticketsRepository.find({
      where: {
        archived: false,
      },
      order: {
        updatedAt: 'ASC',
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });
    const ticketsIDs = [];
    for (const ticket of tickets) {
      if (dayjs().diff(dayjs(ticket.updatedAt), 'months') >= 2) {
        ticketsIDs.push(ticket.id);
      }
    }
    if (ticketsIDs.length)
      await this.ticketsRepository.update(
        { id: In(ticketsIDs) },
        {
          archived: true,
        },
      );
  }

  // create ticket
  async insert(ticketData: TicketDto) {
    /* This is a query to get a random user from the database. 
    const user = await this.userRepository
      .createQueryBuilder('user')
      .select('user.id')
      .where('user.user_type = :user_type', { user_type: 'SUPPORT' })
      .andWhere('user.teamId = :teamId', { teamId: ticketData.target_team })
      .andWhere('user.role = :role', { role: 'TEAMMEMBER' })
      .orderBy('RANDOM()')
      .limit(1)
      .getOne();
    ticketData.assigned_to = user.id as unknown as User; */
    const ticket = await this.ticketsRepository.save(ticketData);
    return ticket;
  }
  // update the first message as read
  async updateRead(user: number, ticket: number) {
    await this.messagesRepository.query(
      `UPDATE messages SET read = read || ${user} WHERE messages."ticketId" = ${ticket}`,
    );
  }

  // find one ticket
  async findOne(id: number) {
    return await this.ticketsRepository.findOne({
      where: {
        id,
      },
      relations: [
        'entity',
        'assigned_to',
        'user',
        'departement',
        'issuer_team',
        'target_team',
        'messages',
        'messages.user',
      ],
      select: [
        'id',
        'subject',
        'type',
        'status',
        'severity',
        'related_ressource',
      ],
    });
  }
  // find all tickets
  async findAll() {
    return await this.ticketsRepository.find({
      order: {
        updatedAt: 'DESC',
      },
      relations: [
        'entity',
        'issuer_team',
        'departement',
        'target_team',
        'user',
        'assigned_to',
      ],
    });
  }

  // count all tickets per month
  async countAllPerMonth() {
    const [, count] = await this.ticketsRepository.findAndCount();
    return count;
  }

  async findAllByIds(ids: number[]) {
    return await this.ticketsRepository.find({
      where: {
        id: In(ids),
      },
      order: {
        updatedAt: 'DESC',
      },
      relations: [
        'entity',
        'issuer_team',
        'departement',
        'target_team',
        'user',
        'assigned_to',
      ],
    });
  }

  paginator(items: Ticket[], current_page: number, per_page_items: number) {
    // eslint-disable-next-line prefer-const
    const page = current_page || 1,
      // eslint-disable-next-line prefer-const
      per_page = per_page_items || 10,
      // eslint-disable-next-line prefer-const
      offset = (page - 1) * per_page,
      paginatedItems = items.slice(offset).slice(0, per_page_items);

    return paginatedItems;
  }

  async findGlobalTickets(queryParams: IqueryParams<Ticket>) {
    const filters = queryParams.filter;
    //remove blank filters
    const where = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => (v && Object.keys(v).length > 0) || typeof v === 'object',
      ),
    );
    let tickets = await this.ticketsRepository.find({
      where: {
        ...where,
        archived: false,
      },
      order: {
        [queryParams.sortField]: queryParams.sortOrder.toUpperCase(),
      },
      relations: [
        'entity',
        'issuer_team',
        'departement',
        'target_team',
        'user',
        'assigned_to',
      ],
    });

    const total = tickets.length;
    // tickets = this.paginator(
    //   tickets,
    //   queryParams.pageNumber,
    //   queryParams.pageSize,
    // );
    tickets = await Promise.all(
      tickets.map(async (ticket) => {
        const unReadMessagesCount = await this.messagesRepository
          .createQueryBuilder('message')
          .where('NOT (:id = ANY (message.read))', { id: queryParams.read })
          .andWhere('message.ticketId = :ticket', { ticket: ticket.id })
          .getCount();
        return {
          ...ticket,
          unread: unReadMessagesCount,
        };
      }),
    );
    return {
      entities: tickets,
      totalCount: total,
      errorMessage: '',
    };
  }

  async findTechTickets(
    queryParams: IqueryParams<Ticket>,
    archived: boolean | null = false,
  ) {
    const filters = queryParams.filter;
    /* It's a way to create a where clause for typeorm query builder. */
    const where = Object.entries(filters).map(([k, v]) => ({
      [k]: Array.isArray(v)
        ? {
            [v[0]]: In(v[1]),
          }
        : v,
    }));
    const query = this.ticketsRepository
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.entity', 'entity')
      .leftJoinAndSelect('ticket.issuer_team', 'issuer_team')
      .leftJoinAndSelect('ticket.departement', 'departement')
      .leftJoinAndSelect('ticket.target_team', 'target_team')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
      .orWhere(where)
      .orderBy('ticket.updatedAt', 'DESC');
    if (archived !== null) {
      query.andWhere('ticket.archived = :archived', { archived });
    }
    let tickets = await query.getMany();
    tickets = tickets.filter(
      (ticket) =>
        !ticket.entity?.id ||
        queryParams.access_entity.includes(ticket.entity?.id),
    );
    const total = tickets.length;
    // add number of unread messages by checking if the user id is not in read array field here it's queryParams.read which comes in request
    tickets = await Promise.all(
      tickets.map(async (ticket) => {
        const unReadMessagesCount = await this.messagesRepository
          .createQueryBuilder('message')
          .where('NOT (:id = ANY (message.read))', { id: queryParams.read })
          .andWhere('message.ticketId = :ticket', { ticket: ticket.id })
          .getCount();
        return {
          ...ticket,
          unread: unReadMessagesCount,
        };
      }),
    );
    return {
      entities: tickets,
      totalCount: total,
      errorMessage: '',
    };
  }

  async findTickets(queryParams: IqueryParams<Ticket>) {
    const filters = queryParams.filter;
    //remove blank filters
    const where = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => v.length > 0 || (typeof v === 'number' && v !== 0),
      ),
    );
    let tickets = await this.ticketsRepository.find({
      where,
      order: {
        [queryParams.sortField]: queryParams.sortOrder.toUpperCase(),
      },
      relations: [
        'entity',
        'issuer_team',
        'departement',
        'target_team',
        'user',
        'assigned_to',
      ],
    });

    // add number of unread messages by checking if the user id is not in read array field here it's queryParams.read which comes in request
    tickets = await Promise.all(
      tickets.map(async (ticket) => {
        const unReadMessagesCount = await this.messagesRepository
          .createQueryBuilder('message')
          .where('NOT (:id = ANY (message.read))', { id: queryParams.read })
          .andWhere('message.ticketId = :ticket', { ticket: ticket.id })
          .getCount();
        return {
          ...ticket,
          unread: unReadMessagesCount,
        };
      }),
    );
    const allTickets = await this.ticketsRepository.find({ where });
    return {
      entities: tickets,
      totalCount: allTickets.length,
      errorMessage: '',
    };
  }

  async delete(ids: number[]) {
    return await this.ticketsRepository.delete(ids);
  }

  async deleteOne(id: number) {
    return await this.ticketsRepository.delete(id);
  }

  async update(id: number, teamData: UpdateTicketDto) {
    return await this.ticketsRepository.update(id, teamData);
  }
  // update last_update filed this filed gets updated with the current date
  // when new action happend on the ticket like new message or status changed
  async updateLastUpdated(id: number, last_update: string) {
    return await this.ticketsRepository.update(id, { last_update });
  }

  async updateStatusForTickets(
    ids: number[],
    assigned_to: User,
    status: TICKET_STATUS,
    closed_by: string,
    resolved_by: string,
  ) {
    try {
      if (status === TICKET_STATUS.Closed && closed_by !== undefined) {
        return await this.ticketsRepository.update(ids, { status, closed_by });
      }
      if (status === TICKET_STATUS.Resolved && resolved_by !== undefined) {
        return await this.ticketsRepository.update(ids, {
          status,
          resolved_by,
        });
      }

      if (!assigned_to) {
        return await this.ticketsRepository.update(ids, { status });
      }
      const tickets = await this.ticketsRepository.find({
        where: {
          id: In(ids),
        },
        relations: {
          assigned_to: true,
        },
      });
      return await Promise.all(
        tickets.map(async (ticket) => {
          if (!ticket.assigned_to) {
            return await this.ticketsRepository.update(ticket.id, {
              status,
              assigned_to,
            });
          }
          return await this.ticketsRepository.update(ticket.id, {
            status,
          });
        }),
      );
    } catch (error) {
      console.log(error);
    }
  }

  // search in messages for support
  async search(body: string, queryParams: IqueryParams<Ticket>) {
    const tickets = (await this.findTechTickets(queryParams, null)).entities; // return tickets by role of the user
    return this.searchMessagesTickets(body, tickets);
  }

  // search in messages for admin
  async searchAdmin(body: string, queryParams: IqueryParams<Ticket>) {
    const tickets = (await this.findTickets(queryParams)).entities; // return tickets by role of the user
    return this.searchMessagesTickets(body, tickets);
  }

  async searchMessagesTickets(body: string, tickets: Ticket[]) {
    const ticketId = tickets.map((tic) => tic.id);

    const message = await this.messagesRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.ticket', 'ticket')
      .leftJoinAndSelect('ticket.user', 'user')
      .leftJoinAndSelect('ticket.entity', 'entity')
      .leftJoinAndSelect('ticket.target_team', 'target_team')
      .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
      .where('message.body ILIKE :body', { body: `%${body}%` })
      .andWhere('ticket.id IN (:...ticketId)', { ticketId: ticketId })
      .distinctOn(['message.ticket'])
      .getMany();

    const result = message.map((el) => el.ticket); // returns tickets of keyword that search about

    return result;
  }

  // pin ticket
  async pin(id: number, pinned: boolean) {
    await this.ticketsRepository.update(id, {
      pinned,
    });
    return 'ok';
  }

  async getCountUnreadMsgTicket(
    queryParams: IqueryParams<Ticket>,
  ): Promise<number> {
    const filters = queryParams.filter;

    if (queryParams.typeUser === META_TYPE.PROD) {
      const where = Object.fromEntries(
        Object.entries(filters).filter(
          ([_, v]) => (v && Object.keys(v).length > 0) || typeof v === 'object',
        ),
      );
      const tickets = await this.ticketsRepository.find({
        where: {
          ...where,
          archived: false,
        },
        order: {
          [queryParams.sortField]: queryParams.sortOrder.toUpperCase(),
        },
        relations: [
          'entity',
          'issuer_team',
          'departement',
          'target_team',
          'user',
          'assigned_to',
        ],
      });
      const unReadMessagesCount = await Promise.all(
        tickets.map(async (ticket) => {
          const unreadTicket = await this.messagesRepository
            .createQueryBuilder('messages')
            .where('NOT (:id = ANY (messages.read))', { id: queryParams.read })
            .andWhere('messages.ticketId = :ticket', { ticket: ticket.id })
            .getCount();
          return unreadTicket;
        }),
      );
      const result = unReadMessagesCount.reduce((pre, cur) => {
        return pre + cur;
      }, 0);

      return result;
    }

    if (queryParams.typeUser === META_TYPE.SUPPORT) {
      const where = Object.entries(filters).map(([k, v]) => ({
        [k]: Array.isArray(v)
          ? {
              [v[0]]: In(v[1]),
            }
          : v,
      }));
      let tickets = await this.ticketsRepository
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.entity', 'entity')
        .leftJoinAndSelect('ticket.issuer_team', 'issuer_team')
        .leftJoinAndSelect('ticket.departement', 'departement')
        .leftJoinAndSelect('ticket.target_team', 'target_team')
        .leftJoinAndSelect('ticket.user', 'user')
        .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
        .orWhere(where)
        .andWhere('ticket.archived IS NOT TRUE')
        .orderBy('ticket.updatedAt', 'DESC')
        .getMany();

      tickets = tickets.filter((ticket) => {
        if (queryParams?.assigned_to) {
          if (ticket?.assigned_to) {
            return (
              (!ticket.entity?.id ||
                queryParams.access_entity.includes(ticket.entity?.id)) &&
              queryParams.assigned_to === ticket.assigned_to?.id
            );
          }
          return (
            !ticket.entity?.id ||
            queryParams.access_entity.includes(ticket.entity?.id)
          );
        }
        return (
          !ticket.entity?.id ||
          queryParams.access_entity.includes(ticket.entity?.id)
        );
      });

      const unReadMessagesCount = await Promise.all(
        tickets.map(async (ticket) => {
          const unreadTicket = await this.messagesRepository
            .createQueryBuilder('messages')
            .where('NOT (:id = ANY (messages.read))', { id: queryParams.read })
            .andWhere('messages.ticketId = :ticket', { ticket: ticket.id })
            .getCount();
          return unreadTicket;
        }),
      );
      const result = unReadMessagesCount.reduce((pre, cur) => {
        return pre + cur;
      }, 0);

      return result;
    }
  }
}
