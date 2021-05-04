import { IsString, IsNotEmpty } from 'class-validator';

export default class UpdateFacilityDto {
  @IsString()
  @IsNotEmpty()
  public serialNumber: string;

  @IsString()
  @IsNotEmpty()
  public manufacturer: string;

  @IsString()
  @IsNotEmpty()
  public model: string;
}
