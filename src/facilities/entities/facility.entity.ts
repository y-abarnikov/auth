import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, Generated } from 'typeorm';
import {ROLES} from "../../common/constants/roles.constants";

@Entity()
export default class Facility {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public serialNumber: string;

  @Column()
  public manufacturer: string;

  @Column()
  @Generated('uuid')
  public refreshToken: string;

  public token?: string;

  public role: string = ROLES.FACILITY;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
