import { OnApplicationInit } from './on_application_init';

export async function initModules(...args: OnApplicationInit[]) {
    for (const module of args) {
        console.debug('Starting module: ' + module.constructor.name);
        await module.init();
    }
}
