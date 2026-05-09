import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permissions.decorator";

@Injectable()
export class PermissionGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredPermissions || requiredPermissions.length === 0) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user || !user.permissions) {
            throw new ForbiddenException('No permissions assigned to user');
        }

        const hasAllPermission = requiredPermissions.every(permission =>
            user.permissions.includes(permission),
        );

        if (!hasAllPermission) {
            const missingPermissions = requiredPermissions.filter(
                p => !user.permissions.includes(p)
            );

            throw new ForbiddenException(`Insufficient permissions. Missing: ${missingPermissions.join(', ')}`);
        }

        return true;
    }
}