import { RequestContext } from './request_context';

/**
 * Typed Request Context shortcut to use for dependencies
 */
export type Context = RequestContext<RequestContextData>;

export interface RequestContextData {
    /**
     * Simple number in the order from the application start
     */
    id: string;

    /**
     * Random RFC4122 UUID representing request across all the instances
     * in multi instance environments.
     */
    uid: string;
}


