import { ConstructorType } from '../types/Types';
import { SimGlobal } from '../global/SimGlobal';
import { SimAtomic } from '../simstance/SimAtomic';

export class RouterModule<R = SimAtomic, M = any> {
    public pathData?: { [name: string]: string };

    constructor(public router?: R, public module?: ConstructorType<M>, public routerChains: R[] = []) {
    }

    getModuleInstance<T = M>(): T {
        return SimGlobal().application.simstanceManager.getOrNewSim(this.module);
    }
}
