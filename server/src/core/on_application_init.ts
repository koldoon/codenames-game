export interface OnApplicationInit {

    /**
     * We don't pass express Application instance to this method,
     * it must be injected via constructor params instead,
     * but the routes must be initialized here anyway.
     *
     * This is done to simplify dependency management,
     * since there are two types of Application instances (formally):
     *   - express.Application
     *   - expressWs.Application
     */
    init(): Promise<any> | any;
}
