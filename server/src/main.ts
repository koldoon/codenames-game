import { Application } from './app/application';

// ... and the World begins
new Application(process.env.CODENAMES_HTTP_PORT || 8091);
