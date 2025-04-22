import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { GetUserDto } from './dtos/getUser.dto';
import { User } from './entities/user.entity';
import { CartService } from '../cart/cart.service';

@Injectable()
export class UserService {
    constructor(
        private userRepository: UserRepository,
        private cartService: CartService,
    ) {}

    async getUsers() {
        return await this.userRepository.findAll();
    }

    async getUser(getUserDto: GetUserDto) {
        return await this.userRepository.find(getUserDto);
    }

    async checkUserExist(getUserDto: GetUserDto) {
        return await this.userRepository.find(getUserDto, { internal: true });
    }

    async createUser(userData: Partial<User>) {
        const user = await this.userRepository.create(userData);

        const createdCart = await this.cartService.create(user.id);

        const updatedUser = await this.userRepository.update(user.id, { cart: createdCart.id });

        return updatedUser;
    }

    async updateUser(id: string, userData: Partial<User>) {
        return await this.userRepository.update(id, userData);
    }

    async deleteUser(id: string) {
        return await this.userRepository.delete(id);
    }
}
