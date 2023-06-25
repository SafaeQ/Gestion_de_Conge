import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { IqueryParams } from '../helpers/enums';
import { Departement } from 'entities/departements';
import { DepartementDto } from 'interfaces/departements.dto';

@Injectable()
export class DepartementsService {
  constructor(
    @InjectRepository(Departement)
    private departementRepository: Repository<Departement>,
  ) {}
  // create entity
  async insert(entityData: DepartementDto) {
    return await this.departementRepository.save(entityData);
  }
  // find entity
  async findOne(id: number) {
    return await this.departementRepository.findOne({
      where: {
        id,
      },
      relations: ['chef'],
      select: ['id', 'name', 'depart_type', 'status', 'chef'],
    });
  }

  // find all departements
  async findAll() {
    return await this.departementRepository.find({
      order: {
        createdAt: 'DESC',
      },
      relations: ['chef'],
    });
  }

  // count all departements
  async countAll() {
    return await this.departementRepository.count({});
  }

  // find paginated Departements
  async findDepartements(queryParams: IqueryParams<Departement>) {
    const filters = queryParams.filter;
    //remove blank filters
    const where = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => v.length > 0 || typeof v === 'number',
      ),
    );
    const departements = await this.departementRepository.find({
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
    const allDepartements = await this.departementRepository.find({ where });
    return {
      entities: departements,
      totalCount: allDepartements.length,
      errorMessage: '',
    };
  }

  // delete bulk entities
  async delete(ids: number[]) {
    return await this.departementRepository.delete(ids);
  }

  // delete one entity
  async deleteOne(id: number) {
    return await this.departementRepository.delete(id);
  }

  // update entity
  async update(id: number, entityData: DepartementDto) {
    return await this.departementRepository.update(id, entityData);
  }
  // update bulk status for departements
  async updateStatusForDepartements(ids: number[], status: string) {
    return await this.departementRepository.update(ids, { status });
  }
}
