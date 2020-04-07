import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { AppController } from './app.controller';
import { GameService } from './game.service';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            // serveRoot: join(__dirname, 'frontend'),
            rootPath: path.join(__dirname, 'frontend'),
            exclude: ['/api/*'],
            serveStaticOptions: {
                maxAge: 0,
                cacheControl: true
            }
        })
    ],
    controllers: [AppController],
    providers: [GameService]
})
export class AppModule {}
