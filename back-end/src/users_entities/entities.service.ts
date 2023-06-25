import { In, Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { MEntity } from 'entities/entities';
import { EntityDto, SyncResponse } from 'interfaces/entity.dto';
import { IqueryParams } from '../helpers/enums';
import { User } from 'entities/user';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class EntitiesService {
  constructor(
    @InjectRepository(MEntity) private entityRepository: Repository<MEntity>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private httpService: HttpService,
  ) {}
  // create entity
  async insert(entityData: EntityDto) {
    const entity = await this.entityRepository.findOne({
      where: {
        name: entityData.name,
      },
    });
    if (!entity) {
      return await this.entityRepository.save(entityData);
    }
    throw new Error('Entity already exist');
  }
  // find entity
  async findOne(id: number) {
    return await this.entityRepository.findOne({
      where: {
        id,
      },
      relations: ['chef'],
      select: ['id', 'name', 'status', 'api_link', 'chef'],
    });
  }

  // find all entities
  async fetchUsersFromApi(id: number) {
    try {
      const entity = await this.entityRepository.findOne({
        where: {
          id,
        },
        select: ['id', 'name', 'status', 'api_link', 'chef'],
      });
      if (entity?.api_link.length > 0) {
        const response = await firstValueFrom(
          this.httpService.post<SyncResponse>(entity.api_link, {}),
        );
        return response.data.data.users;
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  // find all entities
  async syncUsers(users: User[]) {
    for (const user of users) {
      try {
        await this.userRepository.save(user);
      } catch {}
    }
  }

  // find all entities
  async findAll() {
    return await this.entityRepository.find({
      order: {
        createdAt: 'DESC',
      },
      relations: ['chef'],
    });
  }

  // count all entities
  async countAll() {
    return await this.entityRepository.count();
  }

  // find all entities
  async findAllWithUsers() {
    return await this.entityRepository.find({
      where: {
        users: {
          status: 'active',
          visible: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['chef', 'users', 'users.team'],
    });
  }

  // find all entities
  async findAllWithUsersPost(access_entity: number[]) {
    return await this.entityRepository.find({
      where: {
        id: In(access_entity),
        users: {
          status: 'active',
          visible: true,
        },
      },
      order: {
        createdAt: 'DESC',
      },
      relations: ['chef', 'users', 'users.team'],
    });
  }

  // find paginated entities
  async findEntities(queryParams: IqueryParams<MEntity>) {
    const filters = queryParams.filter;
    //remove blank filters
    const where = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => v.length > 0 || typeof v === 'number',
      ),
    );
    const entities = await this.entityRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
      relations: ['chef'],
      skip: (queryParams.pageNumber - 1) * queryParams.pageSize,
      take: queryParams.pageSize,
    });
    const allEntities = await this.entityRepository.find({ where });
    return {
      entities,
      totalCount: allEntities.length,
      errorMessage: '',
    };
  }

  // delete bulk entities
  async delete(ids: number[]) {
    return await this.entityRepository.delete(ids);
  }

  // delete one entity
  async deleteOne(id: number) {
    return await this.entityRepository.delete(id);
  }

  // update entity
  async update(id: number, entityData: EntityDto) {
    return await this.entityRepository.update(id, entityData);
  }
  // update bulk status for entities
  async updateStatusForEntities(ids: number[], status: string) {
    return await this.entityRepository.update(ids, { status });
  }
}
