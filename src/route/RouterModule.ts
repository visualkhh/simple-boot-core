import { ConstructorType } from '../types/Types';
import { SimAtomic } from '../simstance/SimAtomic';
import { Intent } from '../intent/Intent';
import { SimstanceManager } from '../simstance/SimstanceManager';

export class RouterModule<R = SimAtomic, M = any> {
    public pathData?: { [name: string]: string };
    public data?: any;
    public intent?: Intent;
    public onRouteDatas: {simAtomic: SimAtomic, onRouteData: any}[] = []
    constructor(private simstanceManager: SimstanceManager, public router?: R, public module?: ConstructorType<M>, public routerChains: R[] = []) {
    }

    getModuleInstance<T = M>(): T | undefined {
        return this.simstanceManager.getOrNewSim<T>(this.module as any);
    }

    get lastRouteChain() {
        return this.routerChains[this.routerChains.length - 1];
    }

    get lastRouteChainValue() {
        return (this.lastRouteChain as unknown as SimAtomic<any>).value;
    }

    hasActivateInLastRoute(obj: any) {
        return this.lastRouteChainValue?.hasActivate(obj) === true;
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
