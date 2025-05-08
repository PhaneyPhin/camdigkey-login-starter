import { DBErrorCode } from "@common/enums";
import {
  ConflictException,
  InternalServerErrorException,
  RequestTimeoutException,
  UnprocessableEntityException,
} from "@nestjs/common";
import { TimeoutError } from "rxjs";
import { toCamelCase } from "./case";

export const handleDeleteError = (id: string | number, error: any) => {
  if (error.code === "23503") {
    throw new ConflictException(
      `Cannot delete Purchase Order Type with ID ${id} because it is still referenced in the "${error.table}" table. Please remove related records first.`
    );
  }
  throw new InternalServerErrorException();
};

export const handleError = (error, dto) => {
  // ✅ Extract detailed error message
  console.log(error);
  const errorMessage = error.detail || error.message;

  // ✅ Extract the conflicting field dynamically
  let conflictKey: string | null = null;
  if (errorMessage.includes("Key")) {
    const match = errorMessage.match(/\((.*?)\)/); // Extracts `(username)=(admin)`
    if (match) {
      conflictKey = match[1]; // ✅ Extracted conflict key (e.g., "username")
    }
  }

  if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
    const message = `The ${toCamelCase(conflictKey)} '${
      dto[toCamelCase(conflictKey)]
    }' is already in use.`;
    throw new UnprocessableEntityException({
      statusCode: 422,
      message: [
        {
          property: toCamelCase(conflictKey || "field"),
          constraints: {
            unique: message,
          },
          message,
        },
      ],
    });
  }

  if (
    error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
    error.code == DBErrorCode.PgNotNullConstraintViolation
  ) {
    const message = `Foreign key or required field violation. ${errorMessage}`;

    throw new InternalServerErrorException({
      statusCode: 500,
      message: message,
    });
  }

  if (error instanceof TimeoutError) {
    throw new RequestTimeoutException({
      statusCode: 408,
      message: "Database request timeout.",
    });
  }

  throw new InternalServerErrorException({
    statusCode: 500,
    message: "An unexpected error occurred.",
  });
};
