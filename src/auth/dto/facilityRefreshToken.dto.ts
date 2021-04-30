import { IsNotEmpty, IsUUID } from 'class-validator';

export default class FacilityRefreshTokenDto {
  @IsUUID()
  @IsNotEmpty()
  public refreshToken: string;
}
