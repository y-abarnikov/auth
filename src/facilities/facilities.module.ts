import { Module } from '@nestjs/common';
import { FacilitiesService } from './facilities.service';

@Module({
  providers: [FacilitiesService]
})
export class FacilitiesModule {}
