import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { GameService } from './game.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, 'frontend'),
            exclude: ['/api*']
        })
    ],
    controllers: [AppController],
    providers: [GameService]
})
export class AppModule {}
