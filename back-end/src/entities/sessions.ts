import { Login_Type } from 'helpers/enums';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user';

/**
 Defining entities Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  token: string;

  @Column({ length: 250 })
  ip: string;

  @Column('varchar', { array: true, default: [] })
  iphistory: string[];

  @Column('float', { array: true, default: [] })
  ll: number[];

  @ManyToOne(() => User, {
    nullable: true,
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
  })
  user: User;

  @Column({ type: 'varchar', enum: Login_Type })
  type: Login_Type;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
