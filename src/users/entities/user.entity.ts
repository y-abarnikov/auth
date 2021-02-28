import { Exclude } from 'class-transformer';
import {Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn, CreateDateColumn} from 'typeorm';
import RegistrationKey from "../../registration-keys/entities/registrationKey.entity";


@Entity()
class User {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public name: string;

  @Column()
  @Exclude()
  public password: string;

  @OneToOne(() => RegistrationKey)
  @JoinColumn()
  @Exclude()
  public registrationKey: RegistrationKey;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

export default User;
