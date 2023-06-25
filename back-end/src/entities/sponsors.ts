import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { MEntity } from './entities';

/**
   Defining sponsors Table through @Entity typeorm's Decorator
   @see https://typeorm.io/#/entities
  */
@Entity('sponsors')
export class Sponsor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 250, unique: true })
  name: string;

  @Column({ length: 250, select: false })
  login_link: string;

  @Column({ length: 250, default: '', select: false })
  home_link: string;

  @Column('simple-array', { nullable: true, select: false })
  restricted_pages: string[];

  @Column({ length: 250 })
  login_selector: string;

  @Column({ length: 250 })
  password_selector: string;

  @Column({ length: 250 })
  submit_selector: string;

  @Column({ length: 250, select: false })
  username: string;

  @Column({ length: 250, select: false })
  password: string;

  @ManyToMany(() => MEntity, (entity) => entity.sponsors, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  entities: MEntity[];

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
