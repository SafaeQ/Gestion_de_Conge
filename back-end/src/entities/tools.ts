import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { MEntity } from './entities';
/**
 Defining usershifts Table through @Entity typeorm's Decorator
 @see https://typeorm.io/#/entities
*/
@Entity('tools')
export class Tool {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => MEntity, (entity) => entity.tools, { onDelete: 'CASCADE' })
  entity: MEntity;

  @Column('varchar', { length: 250, unique: true })
  tool: string;

  @Column('varchar', { length: 250, unique: true })
  name: string;

  @Column('varchar', { length: 250 })
  server: string;

  @Column()
  port: number;

  @Column('text')
  password: string;

  @Column('varchar', { length: 250, default: '' })
  api_link: string;

  @Column('boolean', { default: false })
  active: boolean;

  @Column('boolean', { default: false })
  deploying: boolean;

  @Column('text', { default: '' })
  logs: string;

  @Column('text', { default: '' })
  description: string;

  @Column('varchar', { default: '' })
  client_url: string;

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
