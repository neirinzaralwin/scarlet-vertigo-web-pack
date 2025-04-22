import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}
    async validateUser(email: string, password: string): Promise<User> {
        const user: User | null = await this.userService.getUser({ email });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const isMatch = await bcrypt.compare(password, user.password); // Use async version
        if (!isMatch) {
            throw new BadRequestException('Password does not match');
        }
        return user;
    }

    private createPayload(user: User) {
        return { email: user.email, sub: user.id, role: user.role };
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const payload = this.createPayload(user);
        return { accessToken: this.jwtService.sign(payload) };
    }

    async register(registerDto: RegisterDto) {
        const existingUser = await this.userService.checkUserExist({
            email: registerDto.email,
        });
        if (existingUser) {
            throw new BadRequestException('email already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const newUser = await this.userService.createUser({
            ...registerDto,
            password: hashedPassword,
        });
        return this.login({ email: newUser.email, password: registerDto.password });
    }
}
