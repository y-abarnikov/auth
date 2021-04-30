import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export default class FacilityRegisterDto {
  @IsString()
  @IsNotEmpty()
  public serialNumber: string;

  @IsString()
  @IsNotEmpty()
  public manufacturer: string;

  @IsString()
  @IsNotEmpty()
  public model: string;

  @IsUUID()
  @IsNotEmpty()
  public registrationKey: string;
}
