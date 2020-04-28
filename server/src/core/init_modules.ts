import { Logecom } from './logecom/logecom';
import { OnApplicationInit } from './on_application_init';

/**
 * Helper for bootstrapping Application async modules
 * @param {OnApplicationInit} args
 * @returns {Promise<void>}
 */
export async function initModules(...args: OnApplicationInit[]) {
    const logger = Logecom.createLogger('ModuleLoader');

    for (const module of args) {
        logger.debug('Starting module:', module.constructor.name);
        await module.init();
    }
}
