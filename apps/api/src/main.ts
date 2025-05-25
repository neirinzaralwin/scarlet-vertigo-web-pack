import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import redoc from 'redoc-express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors();

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Scarlet Vertigo')
        .setDescription('API Documentation for Scarlet Vertigo')
        .setContact('Scarlet Vertigo', 'https://scarlet-vertigo.com', 'scarlet-vertigo.com')
        .setVersion('1.0')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('api', app, document);

    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.get('/docs/swagger.json', (req, res) => {
        res.json(document);
    });

    expressApp.use(
        '/redoc',
        redoc({
            title: 'Scarlet Vertigo API Documentation',
            specUrl: '/docs/swagger.json',

            redocOptions: {
                theme: {
                    colors: {
                        primary: {
                            main: '#8b0000',
                        },
                    },
                },
            },
        }),
    );

    await app.listen(process.env.PORT as string, '0.0.0.0');

    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(`Swagger UI available at: ${await app.getUrl()}/api`);
    console.log(`ReDoc available at: ${await app.getUrl()}/redoc`);
}
bootstrap();
