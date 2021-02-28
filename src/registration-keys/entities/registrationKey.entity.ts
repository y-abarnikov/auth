import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class RegistrationKey {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column('uuid')
  key: string;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}

export default RegistrationKey;
