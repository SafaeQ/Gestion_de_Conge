import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Ticket } from 'entities/tickets';
import { TicketDto, UpdateTicketDto } from 'interfaces/ticket.dto';
import { IqueryParams, META_TYPE, TICKET_STATUS } from '../helpers/enums';
import { Message } from 'entities/messages';
import { User } from 'entities/user';

@Injectable()
export class TicketsMobileService {
  constructor(
    @InjectRepository(Ticket) private ticketsRepository: Repository<Ticket>,
    @InjectRepository(Message) private messagesRepository: Repository<Message>,
  ) {}

  // create ticket
  async insert(ticketData: TicketDto) {
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

  async findGlobalTickets(
    queryParams: IqueryParams<Ticket>,
    pageCurrent: number,
    pageSize: number,
    valueId?: string,
    valueDate?: string,
  ) {
    const filters = queryParams.filter;
    //remove blank filters
    const where = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => (v && Object.keys(v).length > 0) || typeof v === 'object',
      ),
    );

    const value = parseInt(valueId);
    let tickets;

    if (valueId === '' && valueDate === '1970-01-01') {
      tickets = await this.ticketsRepository
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.entity', 'entity')
        .leftJoinAndSelect('ticket.issuer_team', 'issuer_team')
        .leftJoinAndSelect('ticket.departement', 'departement')
        .leftJoinAndSelect('ticket.target_team', 'target_team')
        .leftJoinAndSelect('ticket.user', 'user')
        .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
        .orWhere(where)
        .andWhere('ticket.status = :status', { status: queryParams?.status })
        .orderBy('ticket.updatedAt', 'DESC')
        .getMany();
    } else if (valueId) {
      tickets = await this.ticketsRepository
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.entity', 'entity')
        .leftJoinAndSelect('ticket.issuer_team', 'issuer_team')
        .leftJoinAndSelect('ticket.departement', 'departement')
        .leftJoinAndSelect('ticket.target_team', 'target_team')
        .leftJoinAndSelect('ticket.user', 'user')
        .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
        .where('ticket.id =:id', { id: `${value}` })
        .andWhere(where)
        .orderBy('ticket.updatedAt', 'DESC')
        .getMany();
    } else if (valueDate !== '1970-01-01') {
      tickets = await this.ticketsRepository
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.entity', 'entity')
        .leftJoinAndSelect('ticket.issuer_team', 'issuer_team')
        .leftJoinAndSelect('ticket.departement', 'departement')
        .leftJoinAndSelect('ticket.target_team', 'target_team')
        .leftJoinAndSelect('ticket.user', 'user')
        .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
        .where('ticket.createdAt >= :createdAt', {
          createdAt: valueDate,
        })
        .andWhere(where)
        .andWhere('ticket.status = :status', { status: queryParams?.status })
        .orderBy('ticket.updatedAt', 'ASC')
        .getMany();
    }

    const total = tickets.length;
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
      entities: this.paginator(tickets, pageCurrent, pageSize),
      totalCount: total,
      errorMessage: '',
    };
  }

  async findTechTickets(
    queryParams: IqueryParams<Ticket>,
    pageCurrent: number,
    pageSize: number,
    valueId?: string,
    valueDate?: string,
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
    const value = parseInt(valueId);
    let tickets;

    if (valueId === '' && valueDate === '1970-01-01') {
      tickets = await this.ticketsRepository
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.entity', 'entity')
        .leftJoinAndSelect('ticket.issuer_team', 'issuer_team')
        .leftJoinAndSelect('ticket.departement', 'departement')
        .leftJoinAndSelect('ticket.target_team', 'target_team')
        .leftJoinAndSelect('ticket.user', 'user')
        .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
        .orWhere(where)
        .andWhere('ticket.status = :status', { status: queryParams?.status })
        .orderBy('ticket.updatedAt', 'DESC')
        .getMany();
    } else if (valueId) {
      tickets = await this.ticketsRepository
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.entity', 'entity')
        .leftJoinAndSelect('ticket.issuer_team', 'issuer_team')
        .leftJoinAndSelect('ticket.departement', 'departement')
        .leftJoinAndSelect('ticket.target_team', 'target_team')
        .leftJoinAndSelect('ticket.user', 'user')
        .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
        .where('ticket.id =:id', { id: `${value}` })
        .andWhere(where)
        .andWhere('ticket.status = :status', {
          status: queryParams?.status,
        })
        .orderBy('ticket.updatedAt', 'DESC')
        .getMany();
    } else if (valueDate !== '1970-01-01') {
      tickets = await this.ticketsRepository
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.entity', 'entity')
        .leftJoinAndSelect('ticket.issuer_team', 'issuer_team')
        .leftJoinAndSelect('ticket.departement', 'departement')
        .leftJoinAndSelect('ticket.target_team', 'target_team')
        .leftJoinAndSelect('ticket.user', 'user')
        .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
        .where('ticket.createdAt >= :createdAt', {
          createdAt: valueDate,
        })
        .andWhere(where)
        .andWhere('ticket.status = :status', { status: queryParams?.status })
        .orderBy('ticket.updatedAt', 'ASC')
        .getMany();
    }

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
      entities: this.paginator(tickets, pageCurrent, pageSize),
      totalCount: total,
      errorMessage: '',
    };
  }

  async findTickets(
    queryParams: IqueryParams<Ticket>,
    pageCurrent: number,
    pageSize: number,
    valueId?: string,
    valueDate?: string,
  ) {
    let tickets: Ticket[] = [];

    if (valueId === '' && valueDate === '1970-01-01') {
      tickets = await this.ticketsRepository
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.entity', 'entity')
        .leftJoinAndSelect('ticket.issuer_team', 'issuer_team')
        .leftJoinAndSelect('ticket.departement', 'departement')
        .leftJoinAndSelect('ticket.target_team', 'target_team')
        .leftJoinAndSelect('ticket.user', 'user')
        .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
        .where('ticket.status = :status', { status: queryParams?.status })
        .orderBy('ticket.updatedAt', 'DESC')
        .getMany();
    } else if (valueId) {
      tickets = await this.ticketsRepository
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.entity', 'entity')
        .leftJoinAndSelect('ticket.issuer_team', 'issuer_team')
        .leftJoinAndSelect('ticket.departement', 'departement')
        .leftJoinAndSelect('ticket.target_team', 'target_team')
        .leftJoinAndSelect('ticket.user', 'user')
        .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
        .where('ticket.id = :id', { id: +valueId })
        .andWhere('ticket.status = :status', {
          status: queryParams?.status,
        })
        .orderBy('ticket.updatedAt', 'DESC')
        .getMany();
    } else if (valueDate !== '1970-01-01') {
      tickets = await this.ticketsRepository
        .createQueryBuilder('ticket')
        .leftJoinAndSelect('ticket.entity', 'entity')
        .leftJoinAndSelect('ticket.issuer_team', 'issuer_team')
        .leftJoinAndSelect('ticket.departement', 'departement')
        .leftJoinAndSelect('ticket.target_team', 'target_team')
        .leftJoinAndSelect('ticket.user', 'user')
        .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
        .where('ticket.createdAt >= :createdAt', {
          createdAt: valueDate,
        })
        .andWhere('ticket.status = :status', { status: queryParams?.status })
        .orderBy('ticket.updatedAt', 'ASC')
        .getMany();
    }

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
    // const allTickets = await this.ticketsRepository.find({ where });
    return {
      entities: this.paginator(tickets, pageCurrent, pageSize),
      totalCount: tickets.length,
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

  // search in messages ?
  // async search(body: string, queryParams: IqueryParams<Ticket>) {
  //   const tickets = (await this.findTechTickets(queryParams)).entities; // return tickets by role of the user

  //   const ticketId = tickets.map((tic) => tic.id);

  //   const message = await this.messagesRepository
  //     .createQueryBuilder('message')
  //     .leftJoinAndSelect('message.ticket', 'ticket')
  //     .leftJoinAndSelect('ticket.user', 'user')
  //     .leftJoinAndSelect('ticket.entity', 'entity')
  //     .leftJoinAndSelect('ticket.target_team', 'target_team')
  //     .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
  //     .where('message.body ILIKE :body', { body: `%${body}%` })
  //     .andWhere('ticket.id IN (:...ticketId)', { ticketId: ticketId })
  //     .distinctOn(['message.ticket'])
  //     .getMany();

  //   const result = message.map((el) => el.ticket); // returns tickets of keyword that search about

  //   return result;
  // }

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

  //*****************? get Count of tickets ?******************//

  // get count of tickets by status for Tech
  async ticketsCountTech(queryParams: IqueryParams<Ticket>) {
    const filters = queryParams.filter;
    /* It's a way to create a where clause for typeorm query builder. */
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
      .leftJoinAndSelect('ticket.assigned_to', 'assigned_to')
      .orWhere(where)
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

    const totalOpen = tickets.filter(
      (t) => t.status === TICKET_STATUS.Open,
    ).length;
    const totalClose = tickets.filter(
      (t) => t.status === TICKET_STATUS.Closed,
    ).length;
    const totalResolved = tickets.filter(
      (t) => t.status === TICKET_STATUS.Resolved,
    ).length;
    const totalProgress = tickets.filter(
      (t) => t.status === TICKET_STATUS.In_Progress,
    ).length;
    const totalReopen = tickets.filter(
      (t) => t.status === TICKET_STATUS.Reopened,
    ).length;

    return {
      OpenCount: totalOpen,
      CloseCount: totalClose,
      ResolveCount: totalResolved,
      ProgresCount: totalProgress,
      ReOpenCount: totalReopen,
      errorMessage: '',
    };
  }

  // get count of tickets by status for prod
  async ticketsCountProd(queryParams: IqueryParams<Ticket>) {
    const filters = queryParams.filter;
    /* It's a way to create a where clause for typeorm query builder. */
    const where = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => (v && Object.keys(v).length > 0) || typeof v === 'object',
      ),
    );
    const [, totalOpen] = await this.ticketsRepository.findAndCount({
      where: {
        ...where,
        status: TICKET_STATUS.Open,
      },
    });
    const [, totalClose] = await this.ticketsRepository.findAndCount({
      where: {
        ...where,
        status: TICKET_STATUS.Closed,
      },
    });
    const [, totalResolved] = await this.ticketsRepository.findAndCount({
      where: {
        ...where,
        status: TICKET_STATUS.Resolved,
      },
    });
    const [, totalProgress] = await this.ticketsRepository.findAndCount({
      where: {
        ...where,
        status: TICKET_STATUS.In_Progress,
      },
    });
    const [, totalReopen] = await this.ticketsRepository.findAndCount({
      where: {
        ...where,
        status: TICKET_STATUS.Reopened,
      },
    });

    return {
      OpenCount: totalOpen,
      CloseCount: totalClose,
      ResolveCount: totalResolved,
      ProgresCount: totalProgress,
      ReOpenCount: totalReopen,
      errorMessage: '',
    };
  }

  // get count of tickets by status for  Admin
  async ticketsCountAdmin(queryParams: IqueryParams<Ticket>) {
    const filters = queryParams.filter;
    /* It's a way to create a where clause for typeorm query builder. */
    const where = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => v.length > 0 || (typeof v === 'number' && v !== 0),
      ),
    );

    const [, totalOpen] = await this.ticketsRepository.findAndCount({
      where: {
        ...where,
        status: TICKET_STATUS.Open,
      },
    });
    const [, totalClose] = await this.ticketsRepository.findAndCount({
      where: {
        ...where,
        status: TICKET_STATUS.Closed,
      },
    });
    const [, totalResolved] = await this.ticketsRepository.findAndCount({
      where: {
        ...where,
        status: TICKET_STATUS.Resolved,
      },
    });
    const [, totalProgress] = await this.ticketsRepository.findAndCount({
      where: {
        ...where,
        status: TICKET_STATUS.In_Progress,
      },
    });
    const [, totalReopen] = await this.ticketsRepository.findAndCount({
      where: {
        ...where,
        status: TICKET_STATUS.Reopened,
      },
    });

    return {
      OpenCount: totalOpen,
      CloseCount: totalClose,
      ResolveCount: totalResolved,
      ProgresCount: totalProgress,
      ReOpenCount: totalReopen,
      errorMessage: '',
    };
  }

  //*****************? return array of ids for notifee in frontend ?******************//

  async getTicketsIdsProd(queryParams: IqueryParams<Ticket>) {
    const filters = queryParams.filter;
    //remove blank filters
    const where = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => (v && Object.keys(v).length > 0) || typeof v === 'object',
      ),
    );
    let tickets = await this.ticketsRepository.find({
      where: where,
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
      ids: tickets.map((ticket) => ticket.id),
      errorMessage: '',
    };
  }

  async getTicketsIdsTech(queryParams: IqueryParams<Ticket>) {
    const filters = queryParams.filter;
    /* It's a way to create a where clause for typeorm query builder. */
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
      ids: tickets.map((ticket) => ticket.id),
      totalCount: total,
      errorMessage: '',
    };
  }

  async getTicketsIdAdmin(queryParams: IqueryParams<Ticket>) {
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
      ids: tickets.map((ticket) => ticket.id),
      totalCount: allTickets.length,
      errorMessage: '',
    };
  }
}
