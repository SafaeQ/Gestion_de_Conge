import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  ManyToOne,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { hashSync, genSaltSync } from 'bcryptjs';
import { ROLES, META_TYPE, USER_STATUS } from '../helpers/enums';
import { Ticket } from './tickets';
import { Team } from './teams';
import { Message } from './messages';
import { MEntity } from './entities';
import { Notification } from './notifications';
import { Restriction } from './restrictions';
import { Departement } from './departements';
import { Holiday } from './holidays';
import { Complaint } from './complaint';

/**
 Defining users Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 250, default: '' })
  name: string;

  @OneToMany(() => Ticket, (ticket) => ticket.user)
  tickets: Ticket[];

  @OneToMany(() => Message, (message) => message.user)
  messages: Message[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => Restriction, (restriction) => restriction.user)
  restrictions: Restriction[];

  @ManyToMany(() => Departement, (departement) => departement.users, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinTable()
  departements: Departement[];

  @ManyToOne(() => Team, (team) => team.users, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  team: Team;

  @ManyToOne(() => MEntity, (entity) => entity.users, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  entity: MEntity;

  @OneToMany(() => Holiday, (holiday) => holiday.user)
  holidays: Holiday[];

  @Column({ length: 250, unique: true })
  username: string;

  @Column({ length: 250, select: false })
  password: string;

  @Column({ type: 'varchar', enum: ROLES, default: ROLES.TeamMember })
  role: ROLES;

  @Column({ type: 'varchar', enum: META_TYPE, default: META_TYPE.PROD })
  user_type: META_TYPE;

  @Column('float', { default: 0 })
  solde: number;

  @Column({ default: 'active' })
  status: string;

  @Column({ default: true })
  visible: boolean;

  @Column('int', { array: true, default: [] })
  access_entity: number[];

  @Column('int', { array: true, default: [] })
  access_entity_hr: number[];

  @Column('int', { array: true, default: [] })
  access_team: number[];

  @Column('int', { array: true, default: [] })
  access_planning_teams: number[];

  @Column('int', { default: null })
  order: number;

  @Column({ type: 'varchar', enum: USER_STATUS, default: USER_STATUS.OFFLINE })
  activity: USER_STATUS;

  @OneToMany(() => Complaint, (complaint) => complaint.user)
  complaint: Complaint[];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  lastSelected: Date;
  ip: any;

  @BeforeInsert()
  HashPassword() {
    console.log('HASH');
    //hashing the password before storing it in database
    this.password = hashSync(this.password, genSaltSync(10));
  }
  @BeforeUpdate()
  HashUpdatedPassword() {
    if (this.password) {
      console.log('HASH UPDATED');
      //again hashing the new password before updating it in database
      this.password = hashSync(this.password, genSaltSync(10));
    }
  }
}
