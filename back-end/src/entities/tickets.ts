import { TICKET_SEVERITY, TICKET_STATUS, TICKET_TYPE } from '../helpers/enums';
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
import { Departement } from './departements';
import { MEntity } from './entities';
import { Message } from './messages';
import { Notification } from './notifications';
import { Team } from './teams';
import { User } from './user';

/**
 Defining tickets Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.tickets)
  user: User;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  assigned_to: User;

  @OneToMany(() => Message, (message) => message.ticket)
  messages: Message[];

  @OneToMany(() => Notification, (notification) => notification.ticket)
  notifications: Notification[];

  @ManyToOne(() => MEntity, (entity) => entity.tickets, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  entity: MEntity;

  @ManyToOne(() => Departement, (departement) => departement.tickets, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  departement: Departement;

  @ManyToOne(() => Team, (team) => team.tickets, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  issuer_team: Team;

  @ManyToOne(() => Team, { onDelete: 'SET NULL', nullable: true })
  target_team: Team;

  @Column('varchar', { length: 250, default: '' })
  closed_by: string;

  @Column('varchar', { length: 250, default: '' })
  resolved_by: string;

  @Column({ default: false })
  pinned: boolean;

  @Column({ default: false })
  archived: boolean;

  @Column({ type: 'enum', enum: TICKET_TYPE, default: TICKET_TYPE.Support })
  type: TICKET_TYPE;

  @Column('varchar', { length: 250, default: '' })
  related_ressource: string;

  @Column('varchar', { length: 250, default: '' })
  subject: string;

  @Column({ type: 'enum', enum: TICKET_STATUS, default: TICKET_STATUS.Open })
  status: TICKET_STATUS;

  @Column({
    type: 'enum',
    enum: TICKET_SEVERITY,
    default: TICKET_SEVERITY.MINOR,
    nullable: true,
  })
  severity: TICKET_SEVERITY;

  @Column('varchar', { length: 250, default: '' })
  last_update: string;

  @Column('varchar', { length: 250, default: '' })
  notes: string;

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
