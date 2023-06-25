import { META_TYPE } from '../helpers/enums';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  ManyToMany,
} from 'typeorm';
import { Team } from './teams';
import { Ticket } from './tickets';
import { User } from './user';

/**
   Defining departements Table through @Entity typeorm's Decorator
   @see https://typeorm.io/#/entities
  */
@Entity('departements')
export class Departement {
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

  @OneToMany(() => Ticket, (ticket) => ticket.departement)
  tickets: Ticket[];

  @OneToMany(() => Team, (team) => team.departement)
  teams: Team[];

  @ManyToMany(() => User, (user) => user.departements, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  users: User[];

  @Column({ type: 'varchar', enum: META_TYPE, default: META_TYPE.SUPPORT })
  depart_type: META_TYPE;

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
