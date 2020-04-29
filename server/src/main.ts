import { Application } from './app/application';
import { ConsoleTransport } from './core/logecom/translators/console_transport';
import { Logecom } from './core/logecom/logecom';
import { ErrorFormatter } from './core/logecom/translators/error_formatter';
import { HttpFormatter } from './core/logecom/translators/http_formatter';
import { ObjectFormatter } from './core/logecom/translators/object_formatter';

// Configure logging middleware
Logecom
    .getInstance()
    .use(new ErrorFormatter())
    .use(new HttpFormatter())
    .use(new ObjectFormatter())
    .use(new ConsoleTransport());

// ... and the World begins
new Application(process.env.CODENAMES_HTTP_PORT || 8095);
