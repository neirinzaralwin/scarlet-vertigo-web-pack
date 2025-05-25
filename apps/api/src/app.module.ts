// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UserModule } from './modules/user/user.module';
import { ProductModule } from './modules/product/product.module';
import { SizeModule } from './modules/size/size.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './modules/auth/guards/jwt.guard';
import { JwtStrategy } from './modules/auth/strategies/jwt.strategies';
import { RoleGuard } from './modules/auth/guards/role.guard';
import { CategoryModule } from './modules/category/category.module';
import { CartModule } from './modules/cart/cart.module';
import { OrderModule } from './modules/order/order.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRoot(process.env.DATABASE_URL as string, {
            directConnection: true,
            retryWrites: true,
            retryReads: true,
            serverSelectionTimeoutMS: 5000,
        }),
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'dist', 'apps', 'api', 'public'),
            serveRoot: '/static',
        }),
        UserModule,
        ProductModule,
        SizeModule,
        AuthModule,
        CategoryModule,
        CartModule,
        OrderModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: JwtGuard,
        },
        {
            provide: APP_GUARD,
            useClass: RoleGuard,
        },
        JwtStrategy,
    ],
})
export class AppModule {}
