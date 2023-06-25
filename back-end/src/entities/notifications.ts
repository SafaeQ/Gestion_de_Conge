import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Ticket } from './tickets';
import { User } from './user';

/**
 Defining notifications Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.notifications, {
    onDelete: 'SET NULL',
  })
  user: User;

  @ManyToOne(() => Ticket, (ticket) => ticket.notifications, {
    onDelete: 'CASCADE',
  })
  ticket: Ticket;

  @Column('varchar', { default: '' })
  content: string;

  @Column('int', { array: true, default: [] })
  read: number[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
