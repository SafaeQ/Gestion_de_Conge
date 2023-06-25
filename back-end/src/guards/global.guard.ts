import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';

//global guard to secur all application using jwt
@Injectable()
export class GlobalGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const prod_access_token = request.cookies?.prod_access_token;
    const prod_jid_admin = request.cookies?.prod_jid_admin;

    const admin_access_token = request.cookies?.admin_access_token;
    const admin_jid_admin = request.cookies?.admin_jid_admin;

    const support_access_token = request.cookies?.support_access_token;
    const support_jid_admin = request.cookies?.support_jid_admin;

    const tickets_access_token = request.cookies?.tickets_access_token;
    const tickets_jid_admin = request.cookies?.tickets_jid_admin;

    const hr_access_token = request.cookies?.hr_access_token;
    const hr_jid_admin = request.cookies?.hr_jid_admin;

    if (prod_access_token && prod_jid_admin) {
      try {
        const decoded: any = verify(
          `${prod_access_token}.${prod_jid_admin}`,
          process.env.ACCESS_TOKEN_SECRET,
        );
        if (decoded) {
          return true;
        }
        return false;
      } catch {
        return false;
      }
    } else if (admin_access_token && admin_jid_admin) {
      try {
        const decoded: any = verify(
          `${admin_access_token}.${admin_jid_admin}`,
          process.env.ACCESS_TOKEN_SECRET,
        );
        if (decoded) {
          return true;
        }
      } catch {
        return false;
      }
    } else if (support_access_token && support_jid_admin) {
      try {
        const decoded: any = verify(
          `${support_access_token}.${support_jid_admin}`,
          process.env.ACCESS_TOKEN_SECRET,
        );
        if (decoded) {
          return true;
        }
      } catch {
        return false;
      }
    } else if (tickets_access_token && tickets_jid_admin) {
      try {
        const decoded: any = verify(
          `${tickets_access_token}.${tickets_jid_admin}`,
          process.env.ACCESS_TOKEN_SECRET,
        );
        if (decoded) {
          return true;
        }
      } catch {
        return false;
      }
    } else if (hr_access_token && hr_jid_admin) {
      try {
        const decoded: any = verify(
          `${hr_access_token}.${hr_jid_admin}`,
          process.env.ACCESS_TOKEN_SECRET,
        );
        if (decoded) {
          return true;
        }
      } catch {
        return false;
      }
    }
    return false;
  }
}
