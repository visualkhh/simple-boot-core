import {ConstructorType} from '../types/Types';
import {SimGlobal} from '../global/SimGlobal';

export class RouterModule<R = any, M = any> {
    public pathData?: {[name: string]: string};
    constructor(public router?: R, public module?: ConstructorType<M>, public routerChains: R[] = []) {
    }

    getModuleInstance<T = M>(): T {
        return SimGlobal().application.simstanceManager.getOrNewSim(this.module);
    }
}
