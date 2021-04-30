import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
class RegistrationKey {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('uuid', { unique: true })
  public key: string;

  @Column({ default: false, nullable: false })
  public used: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  public createdAt: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  public updatedAt: Date;
}

export default RegistrationKey;
