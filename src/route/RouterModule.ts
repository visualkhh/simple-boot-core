import {Router} from './Router';
import {Module} from "../module/Module";
import {ConstructorType} from "../types/Types";
import {SimGlobal} from "../global/SimGlobal";

export class RouterModule<R extends Router = Router, M extends Module = Module> {
    constructor(public router?: R, public module?: ConstructorType<M>, public routerChains: Router[] = []) {
    }

    getModuleInstance<T = M>(): T {
        return SimGlobal().application.simstanceManager.getOrNewSim(this.module);
    }

}
