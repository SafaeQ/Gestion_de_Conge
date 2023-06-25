import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import dayjs, { Dayjs } from 'dayjs';
import { Daysoff } from 'entities/daysoff';
import { Holiday } from 'entities/holidays';
import { User } from 'entities/user';
import { REQUEST_HOLIDAY_STATUS, ROLES } from 'helpers/enums';
import { DaysOffDto } from 'interfaces/daysoff.dto';
import { HolidayDto } from 'interfaces/holiday.dto';
import { Raw, Repository } from 'typeorm';
import isBetween from 'dayjs/plugin/isBetween';
dayjs.extend(isBetween);

@Injectable()
export class HolidaysService {
  constructor(
    @InjectRepository(Holiday) private holidaysRepository: Repository<Holiday>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Daysoff) private daysOffRepository: Repository<Daysoff>,
  ) {}

  // get all request of holidays
  async findAll() {
    return this.holidaysRepository.find({
      order: {
        updatedAt: 'DESC',
      },
      relations: ['user'],
    });
  }

  // get all dates of days off
  async findDaysOff() {
    try {
      const data = await this.daysOffRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });
      return data;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
        },
        400,
      );
    }
  }

  //  create dates off
  async createOffDates(daysoff: DaysOffDto) {
    try {
      const daysoffData = new Daysoff();
      daysoffData.date = daysoff.date;
      daysoffData.name = daysoff.name;

      return this.daysOffRepository.save(daysoffData);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
        },
        400,
      );
    }
  }

  // get all request of holidays tech
  async findAllTech(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['entity'],
    });

    // get all request entity's chef
    if (user.role === ROLES.ChefEntity) {
      const queryBuilder = this.holidaysRepository
        .createQueryBuilder('holiday')
        .leftJoinAndSelect('holiday.user', 'user')
        .where(`user.entityId = :entity`, { entity: user?.entity.id })
        .orderBy('holiday.updatedAt', 'DESC');
      return queryBuilder.getMany();
    }

    // get request of own user
    const queryBuilder = this.holidaysRepository
      .createQueryBuilder('holiday')
      .leftJoinAndSelect('holiday.user', 'user')
      .where('user.id =:id', { id })
      .orderBy('holiday.updatedAt', 'DESC');
    return queryBuilder.getMany();
  }

  // get one request of holiday by user id
  async findOne(id: number) {
    return this.holidaysRepository.findOne({
      where: { id },
      relations: ['user', 'user.entity'],
    });
  }

  //  create request for holiday
  async create(holiday: HolidayDto) {
    try {
      const holidayData = new Holiday();
      holidayData.from = holiday.from;
      holidayData.to = holiday.to;
      holidayData.notes = holiday.notes;
      holidayData.status = holiday.status;
      if (holiday.status === REQUEST_HOLIDAY_STATUS.Approve) {
        holidayData.isOkByChef = true;
        holidayData.isOkByHr = true;
      }
      holidayData.user = holiday.user;
      holidayData.createdBy = holiday.createdBy;
      const user = await this.userRepository.findOne({
        where: { id: holiday.user as unknown as number },
      });
      if (user.role === ROLES.ChefEntity) {
        holidayData.isOkByChef = true;
      }
      return this.holidaysRepository.save(holidayData);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'Bad Request',
        },
        400,
      );
    }
  }

  // edit request of holiday by user id
  async update(id: number, holiday: HolidayDto) {
    await this.holidaysRepository.update(id, holiday);
    return this.holidaysRepository.findOne({ where: { id } });
  }

  // update status
  async updateStatus(id: number, status: REQUEST_HOLIDAY_STATUS) {
    return await this.holidaysRepository.update(
      {
        id,
      },
      {
        status,
      },
    );
  }

  // filter by date
  async filterByDate(date: number, id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          id,
        },
        relations: ['entity'],
      });

      if (user && user.role === ROLES.ChefEntity) {
        const filteredRecords = await this.holidaysRepository.find({
          where: {
            user: {
              entity: {
                id: user.entity.id,
              },
            },
            createdAt: Raw((alias) => `EXTRACT(MONTH FROM ${alias}) = ${date}`),
          },
          relations: ['user'],
        });
        return filteredRecords;
      }

      const filteredRecords = await this.holidaysRepository.find({
        where: {
          createdAt: Raw((alias) => `EXTRACT(MONTH FROM ${alias}) = ${date}`),
        },
        relations: ['user'],
      });
      return filteredRecords;
    } catch (error) {
      console.log(error);
    }
  }

  countWeekendDays(start: Dayjs, end: Dayjs) {
    let count = 0;
    let current = start;

    while (current.isBefore(end) || current.isSame(end, 'day')) {
      if (current.day() === 0 || current.day() === 6) {
        // 0 represents Sunday, 6 represents Saturday
        count++;
      }
      current = current.add(1, 'day');
    }

    return count;
  }

  isWeekend(date: dayjs.Dayjs) {
    const dayOfWeek = date.day();
    return dayOfWeek === 6 || dayOfWeek === 0;
  }

  // remove total of dates if the holiday is approved or add it if cancel
  async updateSolde(id: number, holidayId: number) {
    try {
      const holiday = await this.holidaysRepository.findOne({
        where: {
          id: holidayId,
        },
        relations: ['user'],
      });

      const daysOff = await this.daysOffRepository.find();

      if (holiday) {
        const fromDate = dayjs(holiday.from);
        const toDate = dayjs(holiday.to);

        let totalDates = toDate.diff(fromDate, 'days') + 1;
        for (const dayoff of daysOff) {
          const date = dayjs(dayoff.date);
          const weekends = this.countWeekendDays(fromDate, toDate);
          if (date.isBetween(fromDate, toDate, 'date', '[]')) {
            totalDates--;
          }
          if (weekends > 0) {
            totalDates = totalDates - weekends;
          }
        }
        const user = await this.userRepository.findOne({
          where: { id },
        });

        if (user) {
          let solde = 0;

          if (
            holiday.isOkByChef &&
            holiday.isOkByHr &&
            holiday.status === REQUEST_HOLIDAY_STATUS.Approve
          ) {
            solde = user.solde - totalDates;
          } else if (holiday.status === REQUEST_HOLIDAY_STATUS.Cancel) {
            solde = user.solde + totalDates;
            if (user.role === ROLES.ChefEntity) {
              holiday.isOkByHr = false;
            } else {
              if (!holiday.isOkByChef && !holiday.isOkByHr) {
                holiday.isOkByChef = false;
                holiday.isOkByHr = false;
              }
            }
          }
          user.solde = solde;
          await this.userRepository.save(user);
          await this.holidaysRepository.save(holiday);
        }
      }
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

  // get confirmation of chef and HR then change status to approved
  async statusApproved(
    id: number,
    isOkByHr: boolean,
    isOkByChef: boolean,
    isRejectByHr: boolean,
    isRejectByChef: boolean,
    userId: number,
  ) {
    try {
      await this.holidaysRepository.update(id, {
        isOkByHr: isOkByHr,
        isOkByChef: isOkByChef,
        isRejectByHr: isRejectByHr,
        isRejectByChef: isRejectByChef,
      });

      if (isOkByChef && isOkByHr) {
        await this.updateStatus(id, REQUEST_HOLIDAY_STATUS.Approve);
        await this.updateSolde(userId, id);
      } else if (isRejectByHr || isRejectByChef) {
        await this.updateStatus(id, REQUEST_HOLIDAY_STATUS.Reject);
      }
      return;
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

  // get confirmation of chef and HR then change status to approved
  async statusCanceled(id: number, userId: number) {
    try {
      await this.updateStatus(id, REQUEST_HOLIDAY_STATUS.Cancel);
      await this.updateSolde(userId, id);

      return;
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

  // edit public holiday
  async updatePublicHoliday(id: number, daysoff: DaysOffDto) {
    return await this.daysOffRepository.update(id, daysoff);
  }

  // delete public Holidays
  async deletePublicHoliday(id: number) {
    await this.daysOffRepository.delete(id);
  }

  // delete  Holidays
  async deleteHoliday(id: number) {
    await this.holidaysRepository.delete(id);
  }
}
