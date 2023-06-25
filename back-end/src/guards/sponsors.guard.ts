import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { verify } from 'jsonwebtoken';
import { Request } from 'express';

//global guard to secur all application using jwt
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const access_token = request.headers['authorization']?.split(' ')[1];
    if (access_token) {
      try {
        const decoded: any = verify(
          access_token,
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
