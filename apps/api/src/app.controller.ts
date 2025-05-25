import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './modules/auth/decorators/public.decorator';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Public()
    @Get()
    @ApiOperation({ summary: 'Root endpoint' })
    @ApiResponse({ status: 200, description: 'Returns welcome message' })
    getHello(): string {
        return this.appService.getHello();
    }

    @Public()
    @Get('health')
    @ApiOperation({ summary: 'Health check endpoint' })
    @ApiResponse({ status: 200, description: 'Returns application health status' })
    async getHealth() {
        return this.appService.getHealth();
    }
}
