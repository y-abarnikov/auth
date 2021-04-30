import { IsString, IsNotEmpty } from 'class-validator';

export default class GenerateFacilityTokenDto {
  @IsString()
  @IsNotEmpty()
  public registrationKey: string;
}
