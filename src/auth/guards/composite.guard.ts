import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ThrottlerGuard } from "@nestjs/throttler";
import { PasswordChangeGuard } from "./password-change.guard";

@Injectable()
export class CompositeGuard implements CanActivate {
    constructor(
        private throttlerGuard: ThrottlerGuard,
        private passwordChangeGuard: PasswordChangeGuard,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const canActivateThrottler = await this.throttlerGuard.canActivate(context);
        if (!canActivateThrottler) return false;

        const canActivatePasswordChange = await this.passwordChangeGuard.canActivate(context);
        if (!canActivatePasswordChange) return false;

        return true;
    }
}