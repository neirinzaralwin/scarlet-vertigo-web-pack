import { Controller, Get, Put, Delete, Body, Param, Request, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtPayload } from '../auth/interfaces/jwtPayload.interface';
import { Types } from 'mongoose';
import { isAuthorized } from '../auth/decorators/isAuthorized.decorator';
import { ApiOperation, ApiCreatedResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';

// @UseGuards(RoleGuard)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @isAuthorized()
    @Get('/all')
    @ApiOperation({ summary: 'Get all users' })
    @ApiCreatedResponse({ description: 'Get all users', type: [User] })
    async getUsers() {
        return this.userService.getUsers();
    }

    @Get()
    @ApiOperation({ summary: 'Get User' })
    @ApiCreatedResponse({ description: 'Get one user', type: User })
    async getUser(@Request() req: any) {
        const { id } = req.query;

        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid user ID format');
        }

        return this.userService.getUser({ id });
    }

    @Put('/:id')
    async updateUser(@Param('id') id: string, @Body() userData: Partial<User>) {
        return this.userService.updateUser(id, userData);
    }

    @Delete('/:id')
    async deleteUser(@Param('id') id: string) {
        return this.userService.deleteUser(id);
    }

    @Get('/me')
    async getMe(@Request() req: { user: JwtPayload }) {
        return this.userService.getUser({ id: req.user.sub });
    }
}
