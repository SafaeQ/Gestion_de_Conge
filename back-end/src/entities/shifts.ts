import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user';
import { MEntity } from './entities';

/**
 Defining shifts Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('shifts')
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 255 })
  value: string;

  @Column('boolean', { default: true })
  todelete: boolean;

  @Column('boolean', { default: false })
  deleted: boolean;

  @Column('boolean', { default: false })
  holiday: boolean;

  @Column('varchar', { length: 255 })
  bgColor: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => MEntity, { onDelete: 'CASCADE' })
  entity: MEntity;

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
