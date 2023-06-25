import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Shift } from '../entities/shifts';
import { In, Repository } from 'typeorm';
import { shiftDto } from 'interfaces/shift.dto';
import { UserShift } from 'entities/usershifts';

@Injectable()
export class ShiftsService {
  constructor(
    @InjectRepository(Shift) private shiftsRepository: Repository<Shift>,
    @InjectRepository(UserShift)
    private recordsRepository: Repository<UserShift>,
  ) {}

  public Shift: Shift = new Shift();

  //   find all
  getAllShifts() {
    return this.shiftsRepository.find({
      relations: ['user', 'entity'],
    });
  }

  //   find all
  countAll() {
    return this.shiftsRepository.count({});
  }

  // create shift
  async createShifts(shift: shiftDto) {
    const newShifts = this.shiftsRepository.create(shift);
    await this.shiftsRepository.save(newShifts);
    return newShifts;
  }

  // generate shifts
  async generateDefaultShifts() {
    const records = await this.shiftsRepository.find({
      where: {
        value: In([
          '09h00-19h00',
          '10h00-20h00',
          '12h00-22h00',
          '14h30-00h00',
          'Day Off',
        ]),
      },
    });
    if (records.length === 0) {
      return await this.shiftsRepository.save([
        {
          value: '09h00-19h00',
          bgColor: '#3ea8ea',
          todelete: false,
        },
        {
          value: '10h00-20h00',
          bgColor: '#8ef0ac',
          todelete: false,
        },
        {
          value: '12h00-22h00',
          bgColor: '#dbf08e',
          todelete: false,
        },
        {
          value: '14h30-00h00',
          bgColor: '#2e661a',
          todelete: false,
        },
        {
          value: 'Day Off',
          bgColor: '#f4a22f',
          todelete: false,
        },
      ]);
    }
  }

  //   // delete shift
  //   async deleteShifts(id: number) {
  //     const [, count] = await this.recordsRepository.findAndCount({
  //       where: {
  //         shift: {
  //           id,
  //         },
  //       },
  //     });
  //     if (count > 0) {
  //       throw new BadRequestException('Shift not to be deleted');
  //     }
  //     const deletedShifts = await this.shiftsRepository.delete({
  //       todelete: true,
  //       id,
  //     });
  //     if (!deletedShifts.affected) {
  //       throw new HttpException('Shift not found', HttpStatus.NOT_FOUND);
  //     }
  //   }
  // }

  // delete shift
  async deleteShifts(id: number, deleted: boolean) {
    try {
      return await this.shiftsRepository.update(id, { deleted });
    } catch (err) {
      console.log(err);
    }
  }
}
