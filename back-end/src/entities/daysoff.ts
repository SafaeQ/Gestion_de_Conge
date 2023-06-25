import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

/**
 Defining tickets Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('daysoff')
export class Daysoff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('varchar', { length: 250, default: '' })
  name: string;

  @Column('varchar', { length: 255 })
  date: string;

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
