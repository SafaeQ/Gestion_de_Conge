import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Topic } from './topics';
import { User } from './user';

/**
 Defining conversations Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  from: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  to: User;

  @ManyToOne(() => Topic, (topic) => topic.messages, {
    onDelete: 'SET NULL',
  })
  topic: Topic;

  @Column('text', { default: '' })
  msg: string;

  @Column('int', { array: true, default: [] })
  read: number[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deletedAt: Date;
}
