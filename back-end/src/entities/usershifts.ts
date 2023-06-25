import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { Shift } from './shifts';
import { User } from './user';

/**
 Defining usershifts Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('usershifts')
export class UserShift {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Shift, { onDelete: 'CASCADE' })
  shift: Shift;

  @Column('integer')
  boxDay: number;

  @Column()
  day: Date;

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
