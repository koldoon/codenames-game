import { IncomingMessage } from 'http';

export interface RequestContext<T extends {}> {
    get(req: IncomingMessage): T;
}
