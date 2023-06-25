import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';

//global guard to secur all application using jwt
@Injectable()
export class SupportGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const access_token = request.cookies?.support_access_token;
    const jid_admin = request.cookies?.support_jid_admin;
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
    return false;
  }
}
