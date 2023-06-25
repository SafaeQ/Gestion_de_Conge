import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Message } from 'entities/messages';
import { MessageDto } from 'interfaces/message.dto';

@Injectable()
export class MessagesService {
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
  async findAll(ticketId: number, user: number) {
    // this query add user id to read array to mark messages of this ticket as read
    await this.messagesRepository
      .query(`UPDATE messages SET read = read || ${user} 
       WHERE messages."ticketId" = ${Number(
         ticketId,
       )} AND NOT (${user} = ANY (read))`);

    // get messages of specific ticket
    return await this.messagesRepository.find({
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
