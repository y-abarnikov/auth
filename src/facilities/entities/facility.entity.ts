import { Exclude } from 'class-transformer';
import RegistrationKey from 'src/registration-keys/entities/registrationKey.entity';
import User from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Generated,
  OneToOne,
  JoinColumn,
  ManyToOne,
  DeleteDateColumn,
} from 'typeorm';
import { ROLES } from '../../common/constants/roles.constants';

@Entity()
export default class Facility {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ nullable: false })
  public model: string;

  @Column({ unique: true, nullable: false })
  public serialNumber: string;

  @Column({ nullable: false })
  public manufacturer: string;

  @Column()
  @Generated('uuid')
  public refreshToken: string;

  @OneToOne(() => RegistrationKey)
  @JoinColumn()
  public registrationKey: RegistrationKey;

  @ManyToOne(() => User)
  @JoinColumn()
  public user: User;

  @Exclude()
  public token?: string;

  @Exclude()
  public role: string = ROLES.FACILITY;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
