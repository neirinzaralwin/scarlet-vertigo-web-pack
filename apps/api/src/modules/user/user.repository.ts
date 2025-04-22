import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './entities/user.entity';
import { Model } from 'mongoose';
import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GetUserDto } from './dtos/getUser.dto';
import { Types } from 'mongoose';

export class UserRepository {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

    private populateFields(query: any) {
        return query.populate({
            path: 'cart',
            select: '-user',
            model: 'Cart',
        });
    }

    async findAll(): Promise<UserDocument[]> {
        try {
            return await this.populateFields(this.userModel.find()).exec();
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async find(getUserDto: GetUserDto, { internal = false }: { internal?: boolean } = {}): Promise<UserDocument | null> {
        try {
            const searchQuery = {
                ...(getUserDto.email && { email: getUserDto.email }),
                ...(getUserDto.id && { _id: new Types.ObjectId(getUserDto.id) }),
            };

            const user = await this.populateFields(this.userModel.findOne(searchQuery)).exec();
            if (!user) {
                if (internal) return null;
                throw new NotFoundException('User not found');
            }

            return user;
        } catch (err) {
            if (err instanceof NotFoundException) throw err;
            throw new InternalServerErrorException(err.message);
        }
    }
    async create(userData: Partial<User>): Promise<UserDocument> {
        try {
            const savedUser = await this.userModel.create(userData);

            return await this.populateFields(this.userModel.findById(savedUser._id)).exec();
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async update(id: string, userData: Partial<User>): Promise<UserDocument> {
        try {
            const user = await this.populateFields(
                this.userModel.findByIdAndUpdate(id, userData, {
                    new: true,
                }),
            ).exec();

            if (!user) throw new NotFoundException(`User with ID ${id} not found`);

            return user;
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }

    async delete(id: string): Promise<UserDocument> {
        try {
            const user = await this.userModel.findByIdAndDelete(id);

            if (!user) throw new NotFoundException(`User with ID ${id} not found`);

            return user;
        } catch (err) {
            throw new InternalServerErrorException(err.message);
        }
    }
}
