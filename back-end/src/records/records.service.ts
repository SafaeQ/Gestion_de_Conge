import { UserShift } from './../entities/usershifts';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RecordsService {
  constructor(
    @InjectRepository(UserShift)
    private readonly usershiftRepository: Repository<UserShift>,
  ) {}

  // create record shift in db
  async createRecordShifts(records: UserShift[]) {
    for (const record of records) {
      const [, count] = await this.usershiftRepository.findAndCount({
        where: {
          user: {
            id: record.user.id,
          },
          shift: {
            id: record.shift.id,
          },
          day: new Date(record.day),
        },
      });
      if (count === 0) await this.usershiftRepository.save(record);
    }
  }

  // deleted record
  async removeRecordShifts(id: number) {
    const deletedRecordShifts = await this.usershiftRepository.delete(id);
    if (!deletedRecordShifts) {
      throw new HttpException('Something went wrong.', HttpStatus.BAD_REQUEST);
    }
  }

  // delete array of ids of record
  async deleteRecords(ids: number[], from: string, to: string) {
    try {
      const deletedRecords = await this.usershiftRepository
        .createQueryBuilder()
        .delete()
        .from(UserShift)
        .where('id IN (:...ids)', { ids })
        .andWhere('day >= :from', { from })
        .andWhere('day <= :to ', { to })
        .execute();
      if (!deletedRecords) {
        throw new HttpException(
          'Something went wrong.',
          HttpStatus.BAD_REQUEST,
        );
      }
      return deletedRecords;
    } catch (error) {
      console.log(error);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: error.message,
        },
        400,
      );
    }
  }

  // save and get the recordshifts
  public async getInit(
    from: string,
    to: string,
    entity: number,
    team: number[],
    departements: number[],
  ) {
    try {
      if (entity && team && typeof team === 'object' && departements) {
        const result = await this.usershiftRepository
          .createQueryBuilder('user_shift')
          .leftJoinAndSelect('user_shift.shift', 'shift')
          .leftJoinAndSelect('user_shift.user', 'user')
          .leftJoinAndSelect('user.team', 'team')
          .where('day >= :from', { from })
          .andWhere('day <= :to ', { to })
          .andWhere('user.entityId= :entityId', { entityId: entity })
          .andWhere('team.id IN (:...id)', {
            id: team,
          })
          .getMany();
        return result;
      } else if (entity && team && typeof team === 'string' && departements) {
        const result = await this.usershiftRepository
          .createQueryBuilder('user_shift')
          .leftJoinAndSelect('user_shift.shift', 'shift')
          .leftJoinAndSelect('user_shift.user', 'user')
          .leftJoinAndSelect('user.team', 'team')
          .where('day >= :from', { from })
          .andWhere('day <= :to ', { to })
          .andWhere('user.entityId= :entityId', { entityId: entity })
          .andWhere('team.id = :id', {
            id: team,
          })
          .getMany();
        return result;
      } else if (entity && departements) {
        const result = await this.usershiftRepository
          .createQueryBuilder('user_shift')
          .leftJoinAndSelect('user_shift.shift', 'shift')
          .leftJoinAndSelect('user_shift.user', 'user')
          .where('day >= :from', { from })
          .andWhere('day <= :to ', { to })
          .andWhere('user.entityId= :entityId', { entityId: entity })
          .getMany();
        return result;
      }

      const result = await this.usershiftRepository
        .createQueryBuilder('user_shift')
        .leftJoinAndSelect('user_shift.shift', 'shift')
        .leftJoinAndSelect('user_shift.user', 'user')
        .where('day >= :from', { from })
        .andWhere('day <= :to ', { to })
        .getMany();
      return result;
    } catch (err) {
      console.log(err);
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: err.message,
        },
        400,
      );
    }
  }
}
