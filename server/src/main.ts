import { Application } from './app/application';
import { Logecom } from './core/logecom/logecom';
import { ConsoleTransport } from './core/logecom/translators/console_transport';
import { ErrorFormatter } from './core/logecom/translators/error_formatter';
import { HttpFormatter } from './core/logecom/translators/http_formatter';
import { ObjectFormatter } from './core/logecom/translators/object_formatter';
import { config } from './config';

// Configure basic logging middleware
Logecom
    .configure()
    .use(new ErrorFormatter(config))
    .use(new HttpFormatter(config))
    .use(new ObjectFormatter(config))
    .use(new ConsoleTransport(config));

// ... and the World begins
new Application(config.httpPort);
