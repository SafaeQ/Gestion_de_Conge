import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Message } from 'entities/messages';
import { MessageDto } from 'interfaces/message.dto';

@Injectable()
export class MessagesMobileService {
  // injecting a Repository of type Message
  constructor(
    @InjectRepository(Message) private messagesRepository: Repository<Message>,
  ) {}

  /** 
    *
    @see src/interfaces/message.dto.ts
    * 
    */
  //insert a message
  async insert(messageData: MessageDto) {
    return await this.messagesRepository.save(messageData);
  }

  //find all and updates read
  /**
   * It updates the read array of all messages of a specific ticket with the user id of the user who is
   * reading the messages
   * @param {number} ticket - number - the id of the ticket
   * @param {number} user - the user id
   * @returns An array of messages
   */

  paginator(items: Message[], current_page: number, per_page_items: number) {
    // eslint-disable-next-line prefer-const
    const page = current_page || 1,
      // eslint-disable-next-line prefer-const
      per_page = per_page_items || 10,
      // eslint-disable-next-line prefer-const
      offset = (page - 1) * per_page,
      paginatedItems = items.slice(offset).slice(0, per_page_items);

    return paginatedItems;
  }
  async findAll(
    ticketId: number,
    user: number,
    pageCurrent: number,
    pageSize: number,
  ) {
    // this query add user id to read array to mark messages of this ticket as read
    await this.messagesRepository
      .query(`UPDATE messages SET read = read || ${user} 
       WHERE messages."ticketId" = ${Number(
         ticketId,
       )} AND NOT (${user} = ANY (read))`);

    // get messages of specific ticket
    const messages = await this.messagesRepository.find({
      where: {
        ticket: {
          id: ticketId,
        },
      },
      relations: ['ticket', 'user'],
      order: {
        createdAt: 'ASC',
      },
    });

    return {
      messages: this.paginator(messages, pageCurrent, pageSize),
      totalMsgs: messages.length,
    };
  }
  // delete messagees
  async delete(ids: number[]) {
    return await this.messagesRepository.delete(ids);
  }

  // update message
  async update(id: number, messageData: MessageDto) {
    return await this.messagesRepository.update(id, messageData);
  }
}
