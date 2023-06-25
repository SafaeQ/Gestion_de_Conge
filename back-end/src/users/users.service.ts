import { In, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { User } from 'entities/user';
import {
  UpdateUserDto,
  UserDto,
  UserRestrictionDto,
} from 'interfaces/user.dto';
import { IqueryParams, ROLES, META_TYPE, USER_STATUS } from '../helpers/enums';
import { Restriction } from 'entities/restrictions';
import { Departement } from 'entities/departements';
import { Session } from 'entities/sessions';
import { Cron } from '@nestjs/schedule';

interface Where {
  entity: number;
  team: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Session) private sessionRepository: Repository<Session>,
    @InjectRepository(Departement)
    private departRepository: Repository<Departement>,
    @InjectRepository(Restriction)
    private restRepository: Repository<Restriction>,
  ) {}

  // create super admin user on start up
  async createSuperAdmin() {
    const user = await this.userRepository.findOne({
      where: {
        username: 'superadmin',
      },
    });
    if (!user) {
      const superUser = {
        name: 'superadmin',
        username: 'superadmin',
        role: ROLES.SuperAdmin,
        entity: null,
        team: null,
        password: process.env.ADMIN_PASS,
        user_type: META_TYPE.ADMIN,
      };
      const entity = Object.assign(new User(), superUser);
      //and then save.
      return await this.userRepository.save(entity);
    }
  }

  async createRestriction(restrictionDto: UserRestrictionDto) {
    const restriction = await this.restRepository.findOne({
      where: {
        user: {
          id: restrictionDto.user,
        },
        departement: {
          id: restrictionDto.departement,
        },
      },
    });
    if (!restriction) {
      const entity = Object.assign(new Restriction(), restrictionDto);
      return await this.restRepository.save(entity);
    } else {
      throw new Error('Restriction already exist');
    }
  }

  async deleteRestriction(id: number) {
    await this.restRepository.delete(id);
  }

  // find one user
  async findOne(id: number) {
    if (!id) {
      return null;
    }
    return await this.userRepository.findOne({
      where: {
        id,
      },
      select: [
        'id',
        'name',
        'role',
        'user_type',
        'status',
        'visible',
        'team',
        'entity',
        'username',
        'access_entity',
        'access_entity_hr',
        'access_team',
        'access_planning_teams',
        'order',
        'activity',
        'solde',
      ],
      relations: [
        'entity',
        'team',
        'departements',
        'restrictions',
        'restrictions.departement',
        'holidays',
      ],
    });
  }

  async findByUserName(username: string) {
    if (!username) {
      return null;
    }
    return await this.userRepository.findOne({
      where: {
        username,
        status: 'active',
      },
      select: [
        'id',
        'name',
        'role',
        'user_type',
        'status',
        'visible',
        'team',
        'entity',
        'username',
        'access_entity',
        'access_entity_hr',
        'order',
        'access_team',
        'activity',
      ],
      relations: [
        'entity',
        'team',
        'departements',
        'restrictions',
        'restrictions.departement',
        'holidays',
      ],
    });
  }

  async loginByUserName(username: string) {
    if (!username) {
      return null;
    }
    return await this.userRepository.findOne({
      where: {
        username,
        status: 'active',
      },
      select: [
        'id',
        'name',
        'role',
        'password',
        'user_type',
        'status',
        'visible',
        'team',
        'entity',
        'username',
        'access_entity',
        'access_entity_hr',
        'access_team',
      ],
      relations: [
        'entity',
        'team',
        'departements',
        'restrictions',
        'restrictions.departement',
        'holidays',
      ],
    });
  }

  /**
   * It returns a user with the given username, if the user is a tech, and if the user is active
   * @param {string} username - string
   */
  async findTechByUserName(username: string) {
    if (!username) {
      return null;
    }
    return await this.userRepository.findOne({
      where: {
        username,
        role: In([ROLES.ChefEntity, ROLES.TeamMember, ROLES.TeamLeader]),
        user_type: META_TYPE.SUPPORT,
        status: 'active',
      },
      relations: [
        'entity',
        'team',
        'departements',
        'restrictions',
        'restrictions.departement',
        'holidays',
      ],
      select: [
        'id',
        'name',
        'role',
        'password',
        'user_type',
        'status',
        'visible',
        'team',
        'entity',
        'username',
        'access_entity',
        'access_team',
        'access_planning_teams',
        'order',
        'activity',
        'access_entity_hr',
        'solde',
      ],
    });
  }

  async findHrByUserName(username: string) {
    if (!username) {
      return null;
    }
    return await this.userRepository.findOne({
      where: {
        username,
        role: In([ROLES.Admin]),
        user_type: META_TYPE.SUPPORT,
        status: 'active',
      },
      relations: [
        'entity',
        'team',
        'departements',
        'restrictions',
        'restrictions.departement',
        'holidays',
      ],
      select: [
        'id',
        'name',
        'role',
        'password',
        'user_type',
        'status',
        'visible',
        'team',
        'entity',
        'username',
        'access_entity',
        'access_team',
        'access_planning_teams',
        'order',
        'activity',
        'access_entity_hr',
        'solde',
      ],
    });
  }

  // used to login users with roles (ChefEntity, Mailer,TL)
  async findGlobalByUserName(username: string) {
    if (!username) {
      return null;
    }
    return await this.userRepository.findOne({
      where: {
        username,
        role: In([ROLES.ChefEntity, ROLES.TeamMember, ROLES.TeamLeader]),
        user_type: META_TYPE.PROD,
        status: 'active',
      },
      relations: [
        'entity',
        'team',
        'departements',
        'restrictions',
        'restrictions.departement',
        'holidays',
      ],
      select: [
        'id',
        'name',
        'role',
        'password',
        'user_type',
        'status',
        'visible',
        'team',
        'entity',
        'username',
        'access_entity',
        'access_team',
        'access_planning_teams',
        'order',
        'activity',
        'access_entity_hr',
        'solde',
      ],
    });
  }
  // used to login users with roles (Admin, SuperAdmin)
  async findOneByUserName(username: string) {
    if (!username) {
      return null;
    }
    return await this.userRepository.findOne({
      where: {
        username,
        role: In([ROLES.Admin, ROLES.SuperAdmin]),
        status: 'active',
        user_type: META_TYPE.ADMIN,
      },
      relations: [
        'entity',
        'team',
        'restrictions',
        'departements',
        'restrictions.departement',
        'holidays',
      ],
      select: [
        'id',
        'name',
        'role',
        'password',
        'user_type',
        'status',
        'visible',
        'team',
        'entity',
        'username',
        'order',
        'activity',
        'access_entity_hr',
        'solde',
      ],
    });
  }

  async insert(userData: UserDto) {
    const user = await this.userRepository.findOne({
      where: {
        username: userData.username,
      },
    });
    if (!user) {
      const departements = await this.departRepository.find({
        where: {
          id: In(userData.departements),
        },
      });
      const newUser = {
        ...userData,
        departements: departements,
      };
      const entity = Object.assign(new User(), newUser);
      return await this.userRepository.save(entity);
    } else {
      throw new Error('UserName already exist');
    }
  }

  async findAllChefUsers() {
    return await this.userRepository.find({
      where: {
        user_type: In([META_TYPE.PROD, META_TYPE.SUPPORT]),
        role: In([ROLES.TeamLeader, ROLES.ChefEntity, ROLES.Admin]),
        status: 'active',
      },
      relations: {
        entity: true,
        departements: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findAllSupportUsers() {
    return await this.userRepository.find({
      where: {
        user_type: META_TYPE.SUPPORT,
        role: In([ROLES.TeamLeader, ROLES.ChefEntity]),
        status: 'active',
      },
      relations: {
        entity: true,
        departements: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // get users with role TEAMLEADER
  async findTeamLeaderUsers() {
    return await this.userRepository.find({
      where: {
        role: ROLES.TeamLeader,
        status: 'active',
      },
      relations: ['entity', 'team'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // get users with role TEAMLEADER AND chef
  async findTeamChefLeaderUsers() {
    return await this.userRepository.find({
      where: {
        role: In([ROLES.TeamLeader, ROLES.ChefEntity]),
        status: 'active',
      },
      relations: ['entity', 'team'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // get users by team
  async findUsersByTeam(team: number) {
    return await this.userRepository.find({
      where: {
        team: {
          id: team,
        },
        status: 'active',
      },
      relations: ['entity', 'team'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // get users by entity
  async findUsersByEntity(entity: number) {
    return await this.userRepository.find({
      where: {
        entity: {
          id: entity,
        },
        status: 'active',
      },
      relations: ['entity', 'team'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // get users by access entity
  async findUsersByAccessEntity(access_entity_hr: number[]) {
    return await this.userRepository.find({
      where: {
        entity: {
          id: In(access_entity_hr),
        },
        status: 'active',
      },
      relations: ['entity', 'team'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  // get all users
  async findAll() {
    const users = await this.userRepository.find({
      order: {
        createdAt: 'DESC',
      },
      relations: [
        'entity',
        'team',
        'restrictions',
        'departements',
        'restrictions.departement',
        'holidays',
      ],
    });
    return users.filter((user) => user.role !== ROLES.SuperAdmin);
  }

  // get number global of users
  async countAllUsers(): Promise<number> {
    return await this.userRepository.count({});
  }

  async findFiltersAll(where: Where) {
    // filter where params for only of type number entity and team
    const where1 = Object.fromEntries(
      Object.entries(where).filter(
        ([_, v]) => v && typeof parseInt(v) === 'number',
      ),
    );
    const users = await this.userRepository.find({
      where: where1,
      relations: ['entity', 'team'],
      order: {
        createdAt: 'DESC',
      },
    });

    // return all users roles except the one in the function
    return users.filter(
      (user) => user.role !== ROLES.Admin && user.role !== ROLES.SuperAdmin,
    );
  }

  async findFiltersAll2(entity: number, team: number, departements: number[]) {
    if (team && typeof team === 'object') {
      const users = await this.userRepository.find({
        where: {
          entity: {
            id: entity,
          },
          team: {
            id: In(team),
          },
          departements: {
            id: In(departements),
          },
          role: Not(In([ROLES.Admin, ROLES.SuperAdmin])),
          status: 'active',
          visible: true,
        },
        relations: ['entity', 'team', 'departements'],
        order: {
          createdAt: 'DESC',
        },
      });
      return users;
    } else if (team && typeof team === 'string') {
      const users = await this.userRepository.find({
        where: {
          entity: {
            id: entity,
          },
          team: {
            id: team,
          },
          departements: {
            id: In(departements),
          },
          role: Not(In([ROLES.Admin, ROLES.SuperAdmin])),
          status: 'active',
          visible: true,
        },
        relations: ['entity', 'team', 'departements'],
        order: {
          createdAt: 'DESC',
        },
      });
      return users;
    }
    const users = await this.userRepository.find({
      where: {
        entity: {
          id: entity,
        },
        departements: {
          id: In(departements),
        },
        role: Not(In([ROLES.Admin, ROLES.SuperAdmin])),
        status: 'active',
        visible: true,
      },
      relations: ['entity', 'team'],
      order: {
        createdAt: 'DESC',
      },
    });
    return users;
  }

  // get paginated filtered users
  async findUsers(queryParams: IqueryParams<User>) {
    const filters = queryParams.filter;
    //remove blank filters
    let where = Object.fromEntries(
      Object.entries(filters).filter(
        ([_, v]) => v.length > 0 || typeof v === 'number',
      ),
    );
    where = Object.entries(where).map(([k, v]) => ({ [k]: v }));
    const users = await this.userRepository.find({
      where: where,
      order: {
        createdAt: 'DESC',
      },
      relations: ['entity', 'team', 'departements'],
      skip: (queryParams.pageNumber - 1) * queryParams.pageSize,
      take: queryParams.pageSize,
    });
    const allUsers = await this.userRepository.find({ where });
    return {
      // remove super user from list we want no action to be applied to it
      entities: users.filter((user) => user.role !== 'SUPERADMIN'),
      totalCount: allUsers.length,
      errorMessage: '',
    };
  }

  // delete users
  async delete(ids: number[]) {
    return await this.userRepository.delete(ids);
  }
  //delete one
  async deleteOne(id: number) {
    return await this.userRepository.delete(id);
  }
  // update one user
  async update(id: number, userData: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    if (!user) throw new Error('User not found');
    const departements = await this.departRepository.find({
      where: {
        id: In(userData.departements),
      },
    });
    const updated = {
      ...user,
      ...userData,
      departements: departements,
    };
    return await this.userRepository.save(updated);
  }
  // bulk update status for users
  async updateStatusForUsers(ids: number[], status: string) {
    return await this.userRepository.update(ids, { status });
  }

  async updateActivtyForUsers(id: number, activity: USER_STATUS) {
    return await this.userRepository.update(id, { activity });
  }

  // update the order of user
  async updateOrderOfUsers(usersObj: User[]) {
    for (const user of usersObj) {
      await this.userRepository.update(user.id, { order: user.order });
    }
    return { message: 'User order updated' };
  }

  // This will be executed every first day of the month
  @Cron('0 0 1 * *')
  async handleCron() {
    const users = await this.userRepository.find({
      where: {
        status: 'active',
      },
    });
    for (const user of users) {
      const currentSolde = user.solde ?? 0;
      const addDay = 1.5;
      user.solde = currentSolde + addDay;
      await this.userRepository.save(user);
    }
  }

  // update the order of user
  async getSolde(id: number) {
    const user_solde = await this.userRepository.findOne({ where: { id } });
    if (!user_solde) {
      throw new Error(`User with ID ${id} not found`);
    }

    return user_solde.solde;
  }
}
