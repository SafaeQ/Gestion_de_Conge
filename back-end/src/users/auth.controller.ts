import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  BadRequestException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { compare } from 'bcryptjs';
import { sign, verify } from 'jsonwebtoken';
import { Request, Response } from 'express';
import { UsersService } from './users.service';
import { lookup } from 'geoip-lite';
import { getClientIp } from 'request-ip';
import { SessionsService } from 'sessions/sessions.service';
import { GlobalGuard } from 'guards/global.guard';

@Controller('api/auth/users')
export class AuthUserController {
  constructor(
    private readonly userService: UsersService,
    private readonly sessionService: SessionsService,
  ) {}

  // get current logged in user by it's jwt
  @Get('admin/me')
  async currentAdmin(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const access_token = req.cookies?.admin_access_token;
      const jid_admin = req.cookies?.admin_jid_admin;
      if (access_token && jid_admin) {
        const decoded: any = verify(
          `${access_token}.${jid_admin}`,
          process.env.ACCESS_TOKEN_SECRET,
        );
        if (decoded) {
          const user = await this.userService.findOneByUserName(
            decoded.username,
          );
          const authToken = sign(
            {
              userId: user.id,
              access_entity: user.access_entity,
              access_team: user.access_team,
              role: user.role,
              username: user.username,
              department: user.departements,
              name: user.name,
              entity: user.entity,
              restrictions: user.restrictions,
              team: user.team,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' },
          );
          const { password, ...rest } = user;
          return res
            .status(200)
            .json({ user: { ...rest, userId: user.id }, authToken });
        } else {
          return res
            .status(200)
            .json({ user: undefined, authToken: undefined });
        }
      } else {
        return res.status(200).json({ user: undefined, authToken: undefined });
      }
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  }

  // get current logged in user by it's jwt
  @Get('tech/me')
  async me(@Req() req: Request, @Res() res: Response): Promise<Response> {
    try {
      const access_token = req.cookies?.support_access_token;
      const jid_admin = req.cookies?.support_jid_admin;
      if (access_token && jid_admin) {
        const decoded: any = verify(
          `${access_token}.${jid_admin}`,
          process.env.ACCESS_TOKEN_SECRET,
        );
        if (decoded) {
          const user = await this.userService.findTechByUserName(
            decoded.username,
          );
          const authToken = sign(
            {
              userId: user.id,
              access_entity: user.access_entity,
              access_team: user.access_team,
              role: user.role,
              username: user.username,
              department: user.departements,
              name: user.name,
              entity: user.entity,
              restrictions: user.restrictions,
              team: user.team,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' },
          );
          const { password, ...rest } = user;
          return res.status(200).json({ user: rest, authToken });
        } else {
          return res
            .status(200)
            .json({ user: undefined, authToken: undefined });
        }
      } else {
        return res.status(200).json({ user: undefined, authToken: undefined });
      }
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  }

  @Get('hr/me')
  async currentHR(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const access_token = req.cookies?.hr_access_token;
      const jid_admin = req.cookies?.hr_jid_admin;
      if (access_token && jid_admin) {
        const decoded: any = verify(
          `${access_token}.${jid_admin}`,
          process.env.ACCESS_TOKEN_SECRET,
        );
        if (decoded) {
          const user = await this.userService.findHrByUserName(
            decoded.username,
          );
          const authToken = sign(
            {
              userId: user.id,
              access_entity: user.access_entity,
              access_team: user.access_team,
              role: user.role,
              username: user.username,
              department: user.departements,
              name: user.name,
              entity: user.entity,
              restrictions: user.restrictions,
              team: user.team,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' },
          );
          const { password, ...rest } = user;
          return res.status(200).json({ user: rest, authToken });
        } else {
          return res
            .status(200)
            .json({ user: undefined, authToken: undefined });
        }
      } else {
        return res.status(200).json({ user: undefined, authToken: undefined });
      }
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  }

  // get current logged in user by it's jwt
  @Get('prod/me')
  async currentProdUser(
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const access_token = req.cookies?.prod_access_token;
      const jid_admin = req.cookies?.prod_jid_admin;
      if (access_token && jid_admin) {
        const decoded: any = verify(
          `${access_token}.${jid_admin}`,
          process.env.ACCESS_TOKEN_SECRET,
        );
        if (decoded) {
          const user = await this.userService.findGlobalByUserName(
            decoded.username,
          );
          const authToken = sign(
            {
              userId: user.id,
              access_entity: user.access_entity,
              access_team: user.access_team,
              role: user.role,
              username: user.username,
              department: user.departements,
              name: user.name,
              entity: user.entity,
              restrictions: user.restrictions,
              team: user.team,
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1d' },
          );
          const { password, ...rest } = user;
          return res.status(200).json({ user: rest, authToken });
        } else {
          return res
            .status(200)
            .json({ user: undefined, authToken: undefined });
        }
      } else {
        return res.status(200).json({ user: undefined, authToken: undefined });
      }
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  }

  @Post('login')
  async login(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const user = await this.userService.loginByUserName(username);
      if (!user) {
        return res.status(403).json({ message: 'Username Do Not Exist' });
      }
      const valid = await compare(password, user.password);
      if (!valid) {
        return res.status(403).json({ message: 'Password not Correct' });
      }
      delete user.password;
      const authToken = sign(
        {
          userId: user.id,
          access_entity: user.access_entity,
          access_team: user.access_team,
          role: user.role,
          username: user.username,
          department: user.departements,
          name: user.name,
          entity: user.entity,
          team: user.team,
        },
        process.env.ACCESS_TOKEN_SECRET,
      );

      return res.status(200).json({ result: true, user, authToken });
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  }

  @Post('mobile/login')
  async mobilelogin(
    @Body('username') username: string,
    @Body('password') password: string,
    @Body('ip') ip: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const user = await this.userService.loginByUserName(username);
      if (!user) {
        return res.status(403).json({ message: 'Username Do Not Exist' });
      }
      const valid = await compare(password, user.password);
      if (!valid) {
        return res.status(403).json({ message: 'Password not Correct' });
      }
      delete user.password;
      const authToken = sign(
        {
          id: user.id,
          access_entity: user.access_entity,
          access_team: user.access_team,
          user_type: user.user_type,
          role: user.role,
          username: user.username,
          departements: user.departements,
          name: user.name,
          entity: user.entity,
          team: user.team,
        },
        process.env.ACCESS_TOKEN_SECRET,
        // {
        //   expiresIn: '35s',
        // },
      );

      const accessToken = authToken.split('.').slice(0, 2).join('.');
      const jid = authToken.split('.').pop();

      const ll = lookup(ip)?.ll;

      const createSession = await this.sessionService.createSessionMobile({
        user: user.id,
        token: authToken,
        ip: ip,
        ll: ll || [0, 0],
      });

      res.cookie('tickets_access_token', accessToken, {
        maxAge: 604800000,
      });
      res.cookie('tickets_jid_admin', jid, {
        maxAge: 604800000,
      });
      return res
        .status(200)
        .json({ result: true, user, authToken, createSession });
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  }

  @Post('mobile/verify')
  @UseGuards(GlobalGuard)
  async mobileVerifyBytoken(
    @Res() res: Response,
    @Body('token') token: string,
  ): Promise<string | Response> {
    try {
      const tokenValue = await this.sessionService.verifyToken(token);
      if (tokenValue) {
        return res.status(200).json({ message: 'ok' });
      }
      throw new BadRequestException('cookie not found');
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  @Post('web/verify')
  async webVerifyBytoken(
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<string | Response> {
    try {
      const prod_access_token = req.cookies?.prod_access_token;
      const prod_jid_admin = req.cookies?.prod_jid_admin;

      const support_access_token = req.cookies?.support_access_token;
      const support_jid_admin = req.cookies?.support_jid_admin;

      const ip = getClientIp(req);

      if (prod_access_token && prod_jid_admin) {
        await this.sessionService.webVerifyToken(
          `${prod_access_token}.${prod_jid_admin}`,
          ip,
        );
        return res.status(200).json({ message: 'ok' });
      } else if (support_access_token && support_jid_admin) {
        await this.sessionService.webVerifyToken(
          `${support_access_token}.${support_jid_admin}`,
          ip,
        );
        return res.status(200).json({ message: 'ok' });
      }
    } catch (error) {
      console.log(error);

      return res.status(403).json({ message: error.message });
    }
  }

  // support login
  @Post('tech/signin')
  async techlogin(
    @Body('username') username: string,
    @Body('password') password: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const user = await this.userService.findTechByUserName(username);
      if (!user) {
        return res.status(403).json({ message: 'Username Do Not Exist' });
      }
      const valid = await compare(password, user.password);
      if (!valid) {
        return res.status(403).json({ message: 'Password not Correct' });
      }
      delete user.password;
      const authToken = sign(
        {
          userId: user.id,
          access_entity: user.access_entity,
          access_team: user.access_team,
          access_planning_teams: user.access_planning_teams,
          role: user.role,
          username: user.username,
          department: user.departements,
          name: user.name,
          entity: user.entity,
          team: user.team,
          order: user.order,
          activity: user.activity,
          solde: user.solde,
        },
        process.env.ACCESS_TOKEN_SECRET,
      );
      const ip = getClientIp(req);
      const ll = lookup(ip)?.ll;

      await this.sessionService.createSessionWeb({
        user: user.id,
        token: authToken,
        ip: ip,
        ll: ll || [0, 0],
      });

      const accessToken = authToken.split('.').slice(0, 2).join('.');
      const jid = authToken.split('.').pop();
      res.cookie('support_access_token', accessToken, {
        // domain:"support.adsglory.net",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie('support_jid_admin', jid, {
        // domain:"support.adsglory.net",
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json({ result: true, user });
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  }

  // global sign in for other roles check findGlobalByUserName in the users.services.ts file to see the roles
  @Post('prod/signin')
  async globallogin(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res() res: Response,
    @Req() req: Request,
  ): Promise<Response> {
    try {
      const user = await this.userService.findGlobalByUserName(username);
      if (!user) {
        return res.status(403).json({ message: 'Username Do Not Exist' });
      }
      const valid = await compare(password, user.password);
      if (!valid) {
        return res.status(403).json({ message: 'Password not Correct' });
      }
      delete user.password;
      const authToken = sign(
        {
          userId: user.id,
          role: user.role,
          username: user.username,
          department: user.departements,
          name: user.name,
          entity: user.entity,
          team: user.team,
          access_team: user.access_team,
          access_planning_teams: user.access_planning_teams,
          order: user.order,
          activity: user.activity,
          solde: user.solde,
        },
        process.env.ACCESS_TOKEN_SECRET,
      );
      const ip = getClientIp(req);
      const ll = lookup(ip)?.ll;

      await this.sessionService.createSessionWeb({
        user: user.id,
        token: authToken,
        ip: ip,
        ll: ll || [0, 0],
      });

      const accessToken = authToken.split('.').slice(0, 2).join('.');
      const jid = authToken.split('.').pop();
      res.cookie('prod_access_token', accessToken, {
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie('prod_jid_admin', jid, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json({ result: true, user });
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  }
  //admin signin
  @Post('admin/signin')
  async create(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const user = await this.userService.findOneByUserName(username);
      if (!user) {
        return res.status(403).json({ message: 'Username Do Not Exist' });
      }
      const valid = await compare(password, user.password);

      if (!valid) {
        return res.status(403).json({ message: 'Password not Correct' });
      }
      delete user.password;
      const authToken = sign(
        {
          userId: user.id,
          access_entity: user.access_entity,
          access_team: user.access_team,
          access_planning_teams: user.access_planning_teams,
          role: user.role,
          username: user.username,
          department: user.departements,
          name: user.name,
          entity: user.entity,
          team: user.team,
          user_type: user.user_type,
          order: user.order,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' },
      );
      const accessToken = authToken.split('.').slice(0, 2).join('.');
      const jid = authToken.split('.').pop();
      res.cookie('admin_access_token', accessToken, {
        // domain:"admin.adsglory.net",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie('admin_jid_admin', jid, {
        // domain:"admin.adsglory.net",
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json({ result: true, user });
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  }

  //Hr signin
  @Post('hr/signin')
  async hrLogin(
    @Body('username') username: string,
    @Body('password') password: string,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const user = await this.userService.findHrByUserName(username);
      if (!user) {
        return res.status(403).json({ message: 'Username Do Not Exist' });
      }
      const valid = await compare(password, user.password);

      if (!valid) {
        return res.status(403).json({ message: 'Password not Correct' });
      }
      delete user.password;
      const authToken = sign(
        {
          userId: user.id,
          access_entity: user.access_entity,
          access_team: user.access_team,
          access_planning_teams: user.access_planning_teams,
          role: user.role,
          username: user.username,
          department: user.departements,
          name: user.name,
          entity: user.entity,
          team: user.team,
          user_type: user.user_type,
          order: user.order,
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '1d' },
      );
      const accessToken = authToken.split('.').slice(0, 2).join('.');
      const jid = authToken.split('.').pop();
      res.cookie('hr_access_token', accessToken, {
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.cookie('hr_jid_admin', jid, {
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      return res.status(200).json({ result: true, user });
    } catch (error) {
      return res.status(403).json({ message: error.message });
    }
  }

  @Post('prod/logout')
  prodLogout(@Res() res: Response): Response {
    try {
      res.clearCookie('prod_access_token');
      res.clearCookie('prod_jid_admin');

      return res.status(200).json({
        status: 200,
        message: 'you are logged out !',
      });
    } catch (error) {
      throw new BadRequestException(error.detail || error.message, '400');
    }
  }

  @Post('admin/logout')
  adminLogout(@Res() res: Response): Response {
    try {
      res.clearCookie('admin_access_token');
      res.clearCookie('admin_jid_admin');

      return res.status(200).json({
        status: 200,
        message: 'you are logged out !',
      });
    } catch (error) {
      throw new BadRequestException(error.detail || error.message, '400');
    }
  }

  @Post('hr/logout')
  hrLogout(@Res() res: Response): Response {
    try {
      res.clearCookie('hr_access_token');
      res.clearCookie('hr_jid_admin');

      return res.status(200).json({
        status: 200,
        message: 'you are logged out !',
      });
    } catch (error) {
      throw new BadRequestException(error.detail || error.message, '400');
    }
  }

  @Post('support/logout')
  supportLogout(@Res() res: Response): Response {
    try {
      res.clearCookie('support_access_token');
      res.clearCookie('support_jid_admin');

      return res.status(200).json({
        status: 200,
        message: 'you are logged out !',
      });
    } catch (error) {
      throw new BadRequestException(error.detail || error.message, '400');
    }
  }
}
