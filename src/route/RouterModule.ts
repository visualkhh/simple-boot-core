import {Router} from './Router';
import {Module} from "../module/Module";
import {ConstructorType} from "../types/Types";
import {SimGlobal} from "../global/SimGlobal";

export class RouterModule<R extends Router = Router, M extends Module = Module> {
    public pathData?: {[name: string]: string};
    constructor(public router?: R, public module?: ConstructorType<M>, public routerChains: R[] = []) {
    }

    getModuleInstance<T = M>(): T {
        return SimGlobal().application.simstanceManager.getOrNewSim(this.module);
    }

}
