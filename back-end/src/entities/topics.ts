import { TOPIC_STATUS } from 'helpers/enums';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { Conversation } from './conversations';
import { User } from './user';

/**
 Defining topics Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  from: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  to: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  updatedby: User;

  @Column('varchar', { default: '' })
  subject: string;

  @Column({ type: 'enum', enum: TOPIC_STATUS, default: TOPIC_STATUS.OPEN })
  status: TOPIC_STATUS;

  @OneToMany(() => Conversation, (conv) => conv.topic)
  messages: Conversation[];

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
