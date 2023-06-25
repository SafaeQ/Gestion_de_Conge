import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';
import { ROLES } from 'helpers/enums';

//admin guard , to secure admin endpoints using jwt
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const access_token = request.cookies?.admin_access_token;
    const jid_admin = request.cookies?.admin_jid_admin;

    const access_tokenSupport = request.cookies?.support_access_token;
    const jid_adminSupport = request.cookies?.support_jid_admin;

    if (access_token && jid_admin) {
      try {
        const decoded: any = verify(
          `${access_token}.${jid_admin}`,
          process.env.ACCESS_TOKEN_SECRET,
        );
        if (decoded) {
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }
    if (access_tokenSupport && jid_adminSupport) {
      try {
        const decoded: any = verify(
          `${access_tokenSupport}.${jid_adminSupport}`,
          process.env.ACCESS_TOKEN_SECRET,
        );

        if (decoded && decoded.role === ROLES.Admin) {
          return true;
        }
        return false;
      } catch {
        return false;
      }
    }
    return false;
  }
}
