import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { GamesController } from './games.controller';
import { GamesService } from './games.service';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: path.join(__dirname, 'frontend'),
            exclude: ['/api/*'],
            serveStaticOptions: {
                maxAge: 0,
                cacheControl: true
            }
        })
    ],
    controllers: [GamesController],
    providers: [GamesService]
})
export class AppModule {}
