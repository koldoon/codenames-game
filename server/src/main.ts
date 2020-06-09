import { Application } from './app/application';
import { config } from './config';
import { Logecom } from './core/logecom/logecom';
import { ConsoleTransport } from './core/logecom/translators/console_transport';
import { ErrorFormatter } from './core/logecom/translators/error_formatter';
import { HttpFormatter } from './core/logecom/translators/http_formatter';
import { MongodbTransport } from './core/logecom/translators/mongodb_transport';
import { ObjectFormatter } from './core/logecom/translators/object_formatter';

// Configure basic logging middleware
Logecom
    .configure()
    .use(new MongodbTransport(config))
    .use(new ErrorFormatter(config))
    .use(new HttpFormatter(config))
    .use(new ObjectFormatter(config))
    .use(new ConsoleTransport(config));

// ... and the World begins
new Application(config.httpPort);
