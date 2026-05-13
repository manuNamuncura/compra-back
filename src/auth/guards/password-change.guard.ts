import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class PasswordChangeGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return true;
    }

    if (user.mustChangePassword) {
      const allowedEndpoints = ['/auth/change-password', '/auth/first-login'];
      const currentUrl = request.url;

      if (!allowedEndpoints.some((endpoint) => currentUrl.include(endpoint))) {
        throw new ForbiddenException(
          'You must change your password before accessing this resource',
        );
      }
    }

    return true;
  }
}
