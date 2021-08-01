import {ConstructorType} from '../types/Types';
import {SimGlobal} from '../global/SimGlobal';

export class RouterModule<R extends Object = Object, M extends Object = Object> {
    public pathData?: {[name: string]: string};
    constructor(public router?: R, public module?: ConstructorType<M>, public routerChains: R[] = []) {
    }

    getModuleInstance<T = M>(): T {
        return SimGlobal().application.simstanceManager.getOrNewSim(this.module);
    }

}
