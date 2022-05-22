import {ConstructorType} from '../types/Types';
import {SimAtomic} from '../simstance/SimAtomic';
import {Intent} from '../intent/Intent';
import {SimstanceManager} from '../simstance/SimstanceManager';
import {getInjection} from '../decorators/inject/Injection';

export class RouterModule<R = SimAtomic, M = any> {
    public pathData?: { [name: string]: string };
    public data?: any;
    public intent?: Intent;
    public propertyKeys?: (string | symbol)[];

    constructor(private simstanceManager: SimstanceManager, public router?: R, public module?: ConstructorType<M>, public routerChains: R[] = []) {
    }

    getModuleInstance<T = M>(propertyKey?: string | symbol, instanceBind: boolean | any = true): T | undefined {
        const instance = this.simstanceManager.getOrNewSim<T>(this.module as any);
        if (propertyKey && this.propertyKeys && this.propertyKeys.includes(propertyKey)) {
            let instanceElement = (instance as any)[propertyKey];
            if (instanceBind && typeof instanceBind === 'boolean') {
                instanceElement = instanceElement.bind(instance);
            } else if (instanceBind && typeof instanceBind === 'object') {
                instanceElement = instanceElement.bind(instanceBind);
            }
            return instanceElement;
        } else {
            return instance;
        }
    }

    executeModuleProperty(propertyKey: string | symbol, ...param: any[]): any {
        const target = this.getModuleInstance() as any;
        if (propertyKey) {
            const config = getInjection(target, propertyKey);
            if (config) {
                const other = new Map<any, any>();
                param.forEach(it => other.set(it.constructor, it));
                return this.simstanceManager.executeBindParameterSim({target, targetKey: propertyKey}, other)
            } else {
                return target[propertyKey](...param);
            }
        }
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

    get queryParams(): { [key: string]: string } | undefined {
        if (this.intent) {
            return this.intent.queryParams;
        }
    }

    get queryParamsAfterDecodeURI(): { [key: string]: string } | undefined {
        if (this.intent) {
            return this.intent.queryParamsAfterDecodeURI;
        }
    }
}
