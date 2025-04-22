import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserRepository } from './user.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { CartModule } from '../cart/cart.module'; // Ensure CartModule is imported

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), JwtModule, CartModule],
    providers: [UserService, UserRepository],
    controllers: [UserController],
    exports: [UserService],
})
export class UserModule {}
