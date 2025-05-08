import { SelectQueryBuilder } from "typeorm";

export type Filter<T> = (query: SelectQueryBuilder<T>, value: any) => SelectQueryBuilder<T>;
