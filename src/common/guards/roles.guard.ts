import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from '@prisma/client'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(
            'roles',[
                context.getHandler(),
                context.getClass(),
            ]
        );
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.roles) {
            throw new ForbiddenException('No roles assigned to user')
        }

        const hasRequiredRole = requiredRoles.some((role) =>
            user.roles.includes(role)
        );

        if (!hasRequiredRole) {
            throw new ForbiddenException('Insufficent permissions');
        }

        return true;
    }
}