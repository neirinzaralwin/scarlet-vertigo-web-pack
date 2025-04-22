import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { USER_ROLE } from '../../../commons/constants/userRoles';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [context.getHandler(), context.getClass()]);
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) return true;

        const isAuthorized = this.reflector.getAllAndOverride<boolean>('isAuthorized', [context.getHandler(), context.getClass()]);

        const isAdmin = this.reflector.getAllAndOverride<boolean>('isAdmin', [context.getHandler(), context.getClass()]);

        const payload: JwtPayload = await this.jwtService.verifyAsync(token, {
            secret: process.env.JWT_SECRET,
        });

        if (isAuthorized) return this.validateIsAuthorized(payload);
        if (isAdmin) return this.validateIsAdmin(payload);
        request['user'] = payload;
        return true;
    }

    private validateIsAdmin(payload: JwtPayload): boolean {
        if (payload.role !== USER_ROLE.admin) {
            throw new UnauthorizedException('You are not admin to access this resource');
        }
        return true;
    }

    private validateIsAuthorized(payload: JwtPayload): boolean {
        if (payload.role !== USER_ROLE.admin && payload.role !== USER_ROLE.moderator) {
            throw new UnauthorizedException('Only admin and moderator can access this resource');
        }
        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers['authorization']?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
