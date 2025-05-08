import { TableColumnOptions } from "typeorm/schema-builder/options/TableColumnOptions";

export const commonFields: TableColumnOptions[] = [
  {
    name: "created_at",
    type: "timestamp with time zone",
    isNullable: false,
    default: "now()",
  },
  {
    name: "updated_at",
    type: "timestamp with time zone",
    isNullable: false,
    default: "now()",
  },
  {
    name: "deleted_at",
    type: "timestamp with time zone",
    isNullable: true, // Allows null since the record may not be deleted
    default: null, // Default to null when not deleted
  },
];
