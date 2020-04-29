import { Application } from './app/application';
import { Logecom } from './core/logecom/logecom';
import { ConsoleTransport } from './core/logecom/translators/console_transport';
import { ErrorFormatter } from './core/logecom/translators/error_formatter';
import { HttpFormatter } from './core/logecom/translators/http_formatter';
import { ObjectFormatter } from './core/logecom/translators/object_formatter';

// Configure logging middleware
const config = { colorize: !process.env.NO_CONSOLE_COLORS };
Logecom
    .getInstance()
    .use(new ErrorFormatter(config))
    .use(new HttpFormatter(config))
    .use(new ObjectFormatter(config))
    .use(new ConsoleTransport(config));

// ... and the World begins
new Application(process.env.CODENAMES_HTTP_PORT || 8095);
