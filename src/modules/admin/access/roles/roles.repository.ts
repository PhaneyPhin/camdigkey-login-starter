import { PaginationRequest } from '@libs/pagination';
import { EntityRepository, Repository } from 'typeorm';
import { RoleEntity } from './role.entity';

@EntityRepository(RoleEntity)
export class RolesRepository extends Repository<RoleEntity> {
}
