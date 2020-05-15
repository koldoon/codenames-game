import { Application } from './app/application';
import { Logecom } from './core/logecom/logecom';
import { ConsoleTransport } from './core/logecom/translators/console_transport';
import { ErrorFormatter } from './core/logecom/translators/error_formatter';
import { HttpFormatter } from './core/logecom/translators/http_formatter';
import { ObjectFormatter } from './core/logecom/translators/object_formatter';
import { env } from './env';

// Configure basic logging middleware
Logecom
    .getInstance()
    .use(new ErrorFormatter(env))
    .use(new HttpFormatter(env))
    .use(new ObjectFormatter(env))
    .use(new ConsoleTransport(env));

// ... and the World begins
new Application(env.httpPort);
