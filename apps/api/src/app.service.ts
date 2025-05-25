import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class AppService {
    constructor(@InjectConnection() private readonly connection: Connection) {}

    getHello(): string {
        return 'Scarlet Vertigo API is running!';
    }

    async getHealth() {
        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            version: '1.0.0',
            services: {
                api: {
                    status: 'healthy',
                    port: process.env.PORT || 3031,
                },
                database: {
                    status: 'unknown' as string,
                    connection: null as string | null,
                    error: null as string | null,
                },
            },
        };

        try {
            // Check database connection
            const dbState = this.connection.readyState;
            const dbStates: { [key: number]: string } = {
                0: 'disconnected',
                1: 'connected',
                2: 'connecting',
                3: 'disconnecting',
            };

            health.services.database.connection = dbStates[dbState] || 'unknown';

            if (dbState === 1) {
                // Test database with a simple operation
                if (this.connection.db) {
                    await this.connection.db.admin().ping();
                    health.services.database.status = 'healthy';
                } else {
                    health.services.database.status = 'unhealthy';
                    health.services.database.error = 'Database instance not available';
                }
            } else {
                health.services.database.status = 'unhealthy';
                health.services.database.error = `Database state: ${health.services.database.connection}`;
            }
        } catch (error) {
            health.services.database.status = 'unhealthy';
            health.services.database.error = error instanceof Error ? error.message : 'Unknown database error';
            health.status = 'degraded';
        }

        return health;
    }
}
