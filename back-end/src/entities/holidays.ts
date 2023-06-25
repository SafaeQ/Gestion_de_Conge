import { REQUEST_HOLIDAY_STATUS } from '../helpers/enums';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user';

/**
 Defining tickets Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('holidays')
export class Holiday {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.holidays, { onDelete: 'CASCADE' })
  user: User;

  @Column('varchar', { length: 250, default: '' })
  notes: string;

  @Column('varchar', { length: 255 })
  from: string;

  @Column('varchar', { length: 255 })
  to: string;

  @Column('varchar', { length: 255, default: '' })
  createdBy: string;

  @Column('boolean', { default: false })
  isOkByHr: boolean;

  @Column('boolean', { default: false })
  isOkByChef: boolean;

  @Column('boolean', { default: false })
  isRejectByHr: boolean;

  @Column('boolean', { default: false })
  isRejectByChef: boolean;

  @Column({
    type: 'enum',
    enum: REQUEST_HOLIDAY_STATUS,
    default: REQUEST_HOLIDAY_STATUS.Open,
  })
  status: REQUEST_HOLIDAY_STATUS;

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
