import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IqueryParams } from '../helpers/enums';
import { Sponsor } from 'entities/sponsors';
import { MEntity } from 'entities/entities';

@Injectable()
export class SponsorsService {
  constructor(
    @InjectRepository(Sponsor)
    private sponsorRepository: Repository<Sponsor>,
    @InjectRepository(MEntity)
    private entitiesRepository: Repository<MEntity>,
  ) {}
  // create sponsor
  async insert(entityData: Sponsor) {
    const entities = await this.entitiesRepository.find({
      where: {
        id: In(entityData.entities),
      },
    });
    const newSponsor = {
      ...entityData,
      entities: entities,
    };
    return await this.sponsorRepository.save(newSponsor);
  }
  // find sponsor
  async findOne(id: number) {
    return await this.sponsorRepository.findOne({
      select: {
        home_link: true,
        login_link: true,
        login_selector: true,
        password_selector: true,
        submit_selector: true,
        username: true,
        password: true,
        restricted_pages: true,
      },
      where: {
        id,
        status: 'active',
      },
    });
  }

  // find sponsor
  async findOneAdmin(id: number) {
    return await this.sponsorRepository.findOne({
      relations: {
        entities: true,
      },
      select: {
        id: true,
        name: true,
        home_link: true,
        login_link: true,
        login_selector: true,
        password_selector: true,
        submit_selector: true,
        username: true,
        password: true,
        status: true,
        restricted_pages: true,
      },
      where: {
        id,
      },
    });
  }

  async findAllSponsors() {
    return await this.sponsorRepository.find({
      relations: {
        entities: true,
      },
      select: {
        id: true,
        name: true,
        home_link: true,
        login_link: true,
        login_selector: true,
        password_selector: true,
        submit_selector: true,
        username: true,
        password: true,
        status: true,
        restricted_pages: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // find all Sponsors
  async findAllGroupByEntity(entityId: number, access_entity: number[]) {
    if (entityId) {
      return await this.entitiesRepository.find({
        where: {
          id: access_entity ? In(access_entity) : entityId,
          status: 'active',
        },
        relations: ['sponsors'],
        order: {
          createdAt: 'DESC',
        },
      });
    }
    return await this.entitiesRepository.find({
      where: {
        status: 'active',
      },
      relations: ['sponsors'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // find all Sponsors
  async findAllByEntity(entityId: number) {
    if (entityId) {
      return await this.sponsorRepository.find({
        where: {
          entities: {
            id: In([entityId]),
          },
          status: 'active',
        },
        select: {
          id: true,
          name: true,
        },
        relations: {
          entities: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    }
    return await this.sponsorRepository.find({
      select: {
        id: true,
        name: true,
      },
      where: {
        status: 'active',
      },
      relations: {
        entities: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // find paginated Sponsors
  async findSponsors(queryParams: IqueryParams<Sponsor>) {
    const filters = queryParams.filter;
    //remove blank filters
    const where = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => v.length > 0 || typeof v === 'number',
      ),
    );
    const sponsors = await this.sponsorRepository.find({
      where,
      /* Used to order the result by createdAt in descending order and also to include the chef
      relation in the result. */
      order: {
        createdAt: 'DESC',
      },
      relations: ['chef'],
      skip: (queryParams.pageNumber - 1) * queryParams.pageSize,
      take: queryParams.pageSize,
    });
    const allSponsors = await this.sponsorRepository.find({ where });
    return {
      entities: sponsors,
      totalCount: allSponsors.length,
      errorMessage: '',
    };
  }

  // delete bulk sponsors
  async delete(ids: number[]) {
    return await this.sponsorRepository.delete(ids);
  }

  // delete one sponsor
  async deleteOne(id: number) {
    return await this.sponsorRepository.delete(id);
  }

  // update sponsor
  async update(id: number, entityData: Sponsor) {
    const sponsor = await this.sponsorRepository.findOne({
      where: {
        id,
      },
    });
    if (!sponsor) throw new Error('sponsor not found');
    const entities = await this.entitiesRepository.find({
      where: {
        id: In(entityData.entities),
      },
    });
    const updated = {
      ...sponsor,
      ...entityData,
      entities: entities,
    };
    return await this.sponsorRepository.save(updated);
  }
  // update bulk status for sponsors
  async updateStatusForSponsors(ids: number[], status: string) {
    return await this.sponsorRepository.update(ids, { status });
  }
}
