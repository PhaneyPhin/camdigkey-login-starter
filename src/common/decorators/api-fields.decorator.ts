import { applyDecorators } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';

export function ApiFields(fields: string[]) {
  return applyDecorators(
    ...fields.map((field) =>
      ApiQuery({
        name: field,
        type: 'string',
        required: false,
        example: ``,
      }),
    ),
  );
}
