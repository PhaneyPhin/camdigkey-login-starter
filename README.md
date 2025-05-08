<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
## Copy environment
$ cp .env.example .env
## optional for database setup
$ docker-compose up -d 
## run install
$ npm install
## run fresh migration
$ npm run migrate:fresh

## Run start
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## General Consistence module
```
$ nest g my-module "modules/admin/access/company:fields=name_en,name_kh,email,website,address_en,address_kh,logo"   \
  --collection ./schematics/my-module/collection.json
```
## CRUD Usage

# BaseCrudService Documentation

The `BaseCrudService` provides a reusable and extensible structure for implementing CRUD services in a NestJS application. It includes methods for pagination, filtering, and query building. Developers can extend this class to implement specific functionality for their services.

---

## Features

- **Pagination**: Built-in support for paginated results.
- **Filtering**: Dynamic filters based on query parameters.
- **Search**: Configurable search logic across multiple fields.
- **Extensibility**: Abstract methods and properties to override in derived classes.

---

## Usage

### 1. Extend the `BaseCrudService`
To create a specific service (e.g., `UsersService`), extend the `BaseCrudService` and implement the required abstract methods.

```typescript
import { Injectable } from '@nestjs/common';
import { BaseCrudService } from './base-crud.service';

@Injectable()
export class UsersService extends BaseCrudService {
  protected queryName = 'u';
  protected FILTER_FIELDS = ['createdBy', 'expiredAt'];
  protected SEARCH_FIELDS = ['username', 'email'];

  protected getFilters() {
    const filters = {
      expiredAt: (query, value) => {
        const [start, end] = value.split(',');
        return query.andWhere('u.created_at BETWEEN :start AND :end', { start, end });
      },
      createdBy: (query, value) => {
        return query.andWhere('u.created_by = :createdBy', { createdBy: value });
      },
    };

    return filters;
  }

  protected getListQuery() {
    return this.usersRepository.createQueryBuilder(this.queryName);
  }

  protected getMapperResponseEntityFields() {
    return (entity) => ({
      id: entity.id,
      username: entity.username,
      email: entity.email,
    });
  }
}
```

---

## Methods and Properties

### Abstract Methods

#### `getFilters()`
- **Purpose**: To define custom filters for querying the database.
- **Example**:

```typescript
protected getFilters() {
  const filters = {
    expiredAt: (query, value) => {
      const [start, end] = value.split(',');
      return query.andWhere('u.created_at BETWEEN :start AND :end', { start, end });
    },
    createdBy: (query, value) => {
      return query.andWhere('u.created_by = :createdBy', { createdBy: value });
    },
  };
  return filters;
}
```

---

#### `getListQuery()`
- **Purpose**: To define the base query for fetching data.
- **Example**:

```typescript
protected getListQuery() {
  return this.usersRepository.createQueryBuilder('u');
}
```

---

#### `getMapperResponseEntityFields()`
- **Purpose**: To map database entities to response DTOs.
- **Example**:

```typescript
protected getMapperResponseEntityFields() {
  return (entity) => ({
    id: entity.id,
    username: entity.username,
    email: entity.email,
  });
}
```

---

### Protected Properties

#### `queryName`
- **Type**: `string`
- **Purpose**: Alias for the query (e.g., `'u'` for `users`).

#### `FILTER_FIELDS`
- **Type**: `string[]`
- **Purpose**: List of fields for direct filtering.

#### `SEARCH_FIELDS`
- **Type**: `string[]`
- **Purpose**: List of fields for search functionality.

---

### Public Methods

#### `list(pagination: PaginationRequest): Promise<PaginationResponseDto<U>>`
- **Purpose**: Retrieves a paginated list of entities with filters applied.
- **Parameters**:
  - `pagination`: Contains pagination, filter, and search parameters.
- **Returns**: A paginated response DTO.
- **Example**:

```typescript
const pagination: PaginationRequest = {
  skip: 0,
  limit: 10,
  order: { 'u.created_at': 'DESC' },
  params: { createdBy: 'admin-id' },
};

const result = await this.list(pagination);
```

---

### Utility Methods

#### `getAllFilters()`
- **Purpose**: Dynamically generates filters for fields and search logic.
- **Example**:

```typescript
protected getAllFilters() {
  const filters = this.getFilters();

  if (this.FILTER_FIELDS) {
    this.FILTER_FIELDS.forEach((field) => {
      filters[field] = (query, value) =>
        query.andWhere(`${this.queryName}.${field} ILIKE :${field}`, {
          [field]: `%${value}%`,
        });
    });
  }

  if (this.SEARCH_FIELDS && this.SEARCH_FIELDS.length > 0) {
    filters['search'] = (query, searchValue) => {
      const searchConditions = this.SEARCH_FIELDS.map(
        (field) => `${this.queryName}.${field} ILIKE :search`,
      ).join(' OR ');

      query.andWhere(`(${searchConditions})`, { search: `%${searchValue}%` });
    };
  }

  return filters;
}
```

#### `applyQueryFilters(query, params)`
- **Purpose**: Applies filters to a query based on parameters.
- **Parameters**:
  - `query`: The TypeORM query builder.
  - `params`: The filter parameters.
- **Example**:

```typescript
protected applyQueryFilters(query, params) {
  const filters = this.getAllFilters();

  for (const [key, value] of Object.entries(params)) {
    if (value && filters && filters[key]) {
      filters[key](query, value);
    }
  }
}
```

---

## Example Use Case

To implement a service for managing users with filtering and pagination:

```typescript
@Injectable()
export class UsersService extends BaseCrudService {
  protected queryName = 'u';
  protected FILTER_FIELDS = ['username', 'email'];
  protected SEARCH_FIELDS = ['username', 'name', 'email'];

  protected getFilters() {
    return {
      username: (query, value) =>
        query.andWhere('u.username ILIKE :username', { username: `%${value}%` }),
      email: (query, value) =>
        query.andWhere('u.email ILIKE :email', { email: `%${value}%` }),
    };
  }

  protected getListQuery() {
    return this.usersRepository.createQueryBuilder(this.queryName);
  }

  protected getMapperResponseEntityFields() {
    return (entity) => ({
      id: entity.id,
      username: entity.username,
      email: entity.email,
    });
  }
}
```


## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

