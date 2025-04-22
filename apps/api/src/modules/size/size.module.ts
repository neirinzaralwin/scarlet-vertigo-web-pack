import { Module } from '@nestjs/common';
import { SizeService } from './size.service';
import { SizeController } from './size.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Size, SizeSchema } from './entities/size.entity';
import { SizeRepository } from './size.repository';
import { JwtModule } from '@nestjs/jwt';

@Module({
    imports: [MongooseModule.forFeature([{ name: Size.name, schema: SizeSchema }]), JwtModule],
    providers: [SizeService, SizeRepository],
    controllers: [SizeController],
})
export class SizeModule {}
