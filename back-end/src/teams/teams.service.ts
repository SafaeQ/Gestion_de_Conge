import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { Team } from 'entities/teams';
import { TeamDto } from 'interfaces/team.dto';
import { IqueryParams } from '../helpers/enums';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team) private teamsRepository: Repository<Team>,
  ) {}

  async insert(teamData: TeamDto) {
    const team = await this.teamsRepository.findOne({
      where: {
        name: teamData.name,
      },
    });
    if (!team) {
      return await this.teamsRepository.save(teamData);
    } else {
      throw new Error('Team already exist');
    }
  }

  async findOne(id: number) {
    return await this.teamsRepository.findOne({
      where: {
        id,
      },
      relations: ['departement'],
    });
  }

  async findAll() {
    return await this.teamsRepository.find({
      order: {
        createdAt: 'DESC',
      },
      relations: ['departement'],
    });
  }

  async countAll() {
    return await this.teamsRepository.count({});
  }

  async findTeams(queryParams: IqueryParams<Team>) {
    const filters = queryParams.filter;
    //remove blank filters
    const where = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => v.length > 0 || typeof v === 'number',
      ),
    );
    const teams = await this.teamsRepository.find({
      where,
      order: {
        createdAt: 'DESC',
      },
      relations: ['departement'],
      skip: (queryParams.pageNumber - 1) * queryParams.pageSize,
      take: queryParams.pageSize,
    });
    const allTeams = await this.teamsRepository.find({ where });
    return {
      entities: teams,
      totalCount: allTeams.length,
      errorMessage: '',
    };
  }

  async delete(ids: number[]) {
    return await this.teamsRepository.delete(ids);
  }

  async deleteOne(id: number) {
    return await this.teamsRepository.delete(id);
  }

  async update(id: number, teamData: TeamDto) {
    return await this.teamsRepository.update(id, teamData);
  }

  async updateStatusForTeams(ids: number[], status: string) {
    return await this.teamsRepository.update(ids, { status });
  }
}
