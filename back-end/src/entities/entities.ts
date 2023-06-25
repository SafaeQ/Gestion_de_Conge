import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { Sponsor } from './sponsors';
import { Ticket } from './tickets';
import { Tool } from './tools';
import { User } from './user';

/**
 Defining entities Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('entities')
export class MEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 250, default: '', unique: true })
  name: string;

  @ManyToOne(() => User, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  chef: User;

  @OneToMany(() => User, (user) => user.entity)
  users: User[];

  @OneToMany(() => Ticket, (ticket) => ticket.entity)
  tickets: Ticket[];

  @Column({ default: '' })
  api_link: string;

  @ManyToMany(() => Sponsor, (sponsor) => sponsor.entities, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinTable()
  sponsors: Sponsor[];

  @OneToMany(() => Tool, (tool) => tool.entity)
  tools: Tool[];

  @Column({ default: 'active' })
  status: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
