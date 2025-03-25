import { ConflictException } from '@nestjs/common';
import { ErrorType } from '@common/enums';

export class CustomerExistsException extends ConflictException {
  constructor(username: string) {
    super({
      errorType: ErrorType.EXIST,
      message: `There's a  'customer' exist`,
    });
  }
}
