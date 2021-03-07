import { v4 as uuidV4 } from 'uuid';
import { Injectable } from "@nestjs/common";

@Injectable()
export class UtilsService {
  public generateUUIDv4(): string {
    return uuidV4();
  }
}
