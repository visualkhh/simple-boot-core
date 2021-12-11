import { ConstructorType } from '../types/Types';
import { SimGlobal } from '../global/SimGlobal';
import { SimAtomic } from '../simstance/SimAtomic';
import { Intent } from '../intent/Intent';

export class RouterModule<R = SimAtomic, M = any> {
    public pathData?: { [name: string]: string };
    public data?: any;
    public intent?: Intent;
    constructor(public router?: R, public module?: ConstructorType<M>, public routerChains: R[] = []) {
    }

    getModuleInstance<T = M>(): T {
        return SimGlobal().application.simstanceManager.getOrNewSim(this.module);
    }

    get queryParams(): { [key:string]: string } | undefined{
        if (this.intent) {
            return this.intent.queryParams;
        }
    }

    get queryParamsAfterDecodeURI(): { [key:string]: string } | undefined{
        if (this.intent) {
            return this.intent.queryParamsAfterDecodeURI;
        }
    }
}
