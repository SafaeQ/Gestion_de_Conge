import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Departement } from './departements';
import { Ticket } from './tickets';
import { User } from './user';

/**
 Defining teams Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 250, default: '', unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.team)
  users: User[];

  @ManyToOne(() => Departement, (departement) => departement.teams, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  departement: Departement;

  @OneToMany(() => Ticket, (ticket) => ticket.issuer_team)
  tickets: Ticket[];

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
