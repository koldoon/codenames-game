import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });

    const options = new DocumentBuilder()
        .setTitle('Codenames Game')
        .setDescription(
            'Codenames is a 2015 card game for 4–8 players designed by Vlaada Chvátil' +
            ' and published by Czech Games. Two teams compete by each having a Spymaster give one word' +
            ' clues which can point to multiple words on the board. The other players on the team attempt' +
            ' to guess their team\'s words while avoiding the words of the other team. In the 2–3 player' +
            ' variant, one Spymaster gives clues to the other player or players.'
        )
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api/spec', app, document);

    app.use(helmet());
    await app.listen(8091, '0.0.0.0');
}

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
bootstrap().then();
