import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from 'entities/sessions';
import { Login_Type } from 'helpers/enums';
import { SessionDto } from 'interfaces/sessions.dto';
import { Repository } from 'typeorm';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
  ) {}
  async findSession() {
    try {
      const sessions = await this.sessionRepository.find({
        relations: ['user'],
        select: [
          'id',
          'user',
          'active',
          'ip',
          'iphistory',
          'type',
          'active',
          'createdAt',
          'updatedAt',
        ],
        order: {
          createdAt: 'DESC',
        },
      });

      return sessions;
    } catch (error) {
      throw new Error(error);
    }
  }
  async updateSession(id: number, active: boolean) {
    try {
      const result = await this.sessionRepository.update(id, { active });

      return result;
    } catch (error) {
      throw new Error(error);
    }
  }
  async getOneSession(id: number) {
    try {
      const result = await this.sessionRepository.findOne({
        where: { id },
      });

      return result;
    } catch (error) {
      throw new Error(error);
    }
  }
  // delete bulk sessions
  async delete(id: number) {
    return await this.sessionRepository.delete(id);
  }

  // session mobile
  async createSessionWeb(sessionDto: SessionDto) {
    const { user, token, ip, ll } = sessionDto;

    try {
      const createSession = this.sessionRepository.create({
        user: { id: user },
        token,
        ip,
        ll,
        type: Login_Type.web,
      });
      return this.sessionRepository.save(createSession);
    } catch (e) {
      console.log(e);
      throw new Error('error creating in service');
    }
  }
  // session mobile
  async createSessionMobile(sessionDto: SessionDto) {
    const { user, token, ip, ll } = sessionDto;

    const userSessoin = await this.sessionRepository.findOne({
      where: { user: { id: sessionDto.user }, type: Login_Type.mobile },
    });

    if (!userSessoin) {
      try {
        const createSession = this.sessionRepository.create({
          user: { id: user },
          token,
          ip,
          ll,
          type: Login_Type.mobile,
        });
        return this.sessionRepository.save(createSession);
      } catch (e) {
        console.log(e);
        throw new Error('error creating in service');
      }
    } else {
      await this.sessionRepository.delete(userSessoin.id);
      try {
        const createSession = this.sessionRepository.create({
          user: { id: user },
          token,
          ip,
          ll,
          type: Login_Type.mobile,
        });
        return this.sessionRepository.save(createSession);
      } catch (e) {
        console.log(e);
        throw new Error('error creating in service');
      }
    }
  }

  //  verify by token
  async verifyToken(token: string) {
    try {
      const tokenSession = await this.sessionRepository.findOne({
        where: { token, active: true, type: Login_Type.mobile },
      });

      if (!tokenSession) {
        throw new BadRequestException('Token not found');
      }
      return 'ok';
    } catch (err) {
      console.log(err);
      throw new Error('error verifying token');
    }
  }
  async webVerifyToken(token: string, ip: string) {
    try {
      const tokenSession = await this.sessionRepository.findOne({
        where: { token, active: true, type: Login_Type.web },
      });

      if (!tokenSession) {
        throw new ForbiddenException('Token not found');
      }

      const result = tokenSession.iphistory.find((el) => el === ip);
      if (!result) {
        tokenSession.iphistory.push(ip);
        await this.sessionRepository.update(tokenSession.id, {
          iphistory: tokenSession.iphistory,
        });
      }

      return 'ok';
    } catch (err) {
      console.log(err);
      throw new Error('error verifying token');
    }
  }
}
