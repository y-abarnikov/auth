import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ROLES } from '../../common/constants/roles.constants';

@Entity()
export default class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public email: string;

  @Column({ nullable: false })
  public name: string;

  @Column({ nullable: false })
  @Exclude()
  public password: string;

  @Exclude()
  public token?: string;

  @Exclude()
  public role: string = ROLES.USER;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
