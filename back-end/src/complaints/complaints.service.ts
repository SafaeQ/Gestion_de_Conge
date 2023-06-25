import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Complaint } from 'entities/complaint';
import { User } from 'entities/user';
import { ROLES } from 'helpers/enums';
import { ComplaintDto } from 'interfaces/complaint.dto';
import { Repository } from 'typeorm';

@Injectable()
export class ComplaintService {
  constructor(
    @InjectRepository(Complaint)
    private complaintRepository: Repository<Complaint>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  // get all complaints
  async findAll() {
    return this.complaintRepository.find({
      order: {
        updatedAt: 'DESC',
      },
      relations: ['user'],
    });
  }

  // get one comlaint by user id
  async findOne(id: number) {
    return this.complaintRepository.findOne({
      where: { id },
      relations: ['user', 'user.entity'],
    });
  }

  //  create complaint
  async create(complaint: ComplaintDto) {
    try {
      const complaintData = this.complaintRepository.create(complaint);
      return this.complaintRepository.save(complaintData);
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

  async findAllComplaint(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['entity'],
    });

    // get all entity's chef
    if (user.role === ROLES.ChefEntity) {
      const queryBuilder = this.complaintRepository
        .createQueryBuilder('complaint')
        .leftJoinAndSelect('complaint.user', 'user')
        .where(`user.entityId = :entity`, { entity: user?.entity.id })
        .orderBy('complaint.updatedAt', 'DESC');
      return queryBuilder.getMany();
    }

    // get complaint of user
    const queryBuilder = this.complaintRepository
      .createQueryBuilder('complaint')
      .leftJoinAndSelect('complaint.user', 'user')
      .where('user.id =:id', { id })
      .orderBy('complaint.updatedAt', 'DESC');
    return queryBuilder.getMany();
  }

  async markAsSeen(id: number, seen: boolean) {
    await this.complaintRepository.update(id, { seen });
    return this.complaintRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async updateComplaint(id: number, complaint: ComplaintDto) {
    await this.complaintRepository.update(id, complaint);
    return this.complaintRepository.findOne({ where: { id } });
  }
}
