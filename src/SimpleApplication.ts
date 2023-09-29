import 'reflect-metadata'
import {SimstanceManager} from './simstance/SimstanceManager';
import {SimOption} from './SimOption';
import {IntentManager} from './intent/IntentManager';
import {RouterManager} from './route/RouterManager';
import {Intent} from './intent/Intent';
import {ConstructorType} from './types/Types';
import {RouterModule} from './route/RouterModule';
import {SimAtomic} from './simstance/SimAtomic';
import {SimNoSuch} from './throwable/SimNoSuch';
import { Sim } from './decorators/SimDecorator';
export class SimpleApplication {
    public simstanceManager: SimstanceManager;
    public intentManager: IntentManager;
    public routerManager: RouterManager;
    public rootRouter?: ConstructorType<Object> | Function;
    public option: SimOption;
    constructor();
    constructor(option: SimOption);
    constructor(rootRouter?: ConstructorType<Object> | Function);
    constructor(rootRouter?: ConstructorType<Object> | Function, option?: SimOption);
    constructor(rootRouter?: (ConstructorType<Object> | Function) | SimOption, option = new SimOption()) {
        if (rootRouter instanceof SimOption) {
            option = rootRouter;
        } else if (typeof rootRouter === 'function') {
            this.rootRouter = rootRouter;
        }
        this.option = option;
        this.simstanceManager = new SimstanceManager(option);
        this.simstanceManager.set(SimpleApplication, this);
        this.simstanceManager.set(SimstanceManager, this.simstanceManager);

        this.intentManager = this.simstanceManager.proxy(new IntentManager(this.simstanceManager));
        this.routerManager = this.simstanceManager.proxy(new RouterManager(this.simstanceManager, this.rootRouter));
        this.simstanceManager.set(IntentManager, this.intentManager);
        this.simstanceManager.set(RouterManager, this.routerManager);
    }

    public getSimstanceManager() {
        return this.simstanceManager;
    }

    public getIntentManager() {
        return this.intentManager;
    }

    public getRouterManager() {
        return this.routerManager;
    }

    public run(otherInstanceSim?: Map<ConstructorType<any>, any>) {
        this.simstanceManager.run(otherInstanceSim);
        return this.simstanceManager;
    }

    public simAtomic<T>(type: ConstructorType<T> | Function) {
        const routerAtomic = new SimAtomic<T>(type, this.simstanceManager);
        return routerAtomic;
    }

    public getInstance<T>(type: ConstructorType<T>) {
        const i = this.sim<T>(type);
        if (i) {
            return i;
        } else {
            throw new SimNoSuch('SimNoSuch: no simple instance. ' + 'name:' + type?.prototype?.constructor?.name + ',' + type)
        }
    }

    public sim<T>(type: ConstructorType<T> | Function) {
        return this.simAtomic<T>(type).value;
    }

    public publishIntent(i: string, data?: any): any[];
    public publishIntent(i: Intent): any[];
    public publishIntent(i: Intent | string, data?: any): any[] {
        if (i instanceof Intent) {
            return this.intentManager.publish(i);
        } else {
            return this.intentManager.publish(i, data);
        }
    }

    public routing<R = SimAtomic, M = any>(i: string, data?: any): Promise<RouterModule<R, M>>;
    public routing<R = SimAtomic, M = any>(i: Intent): Promise<RouterModule<R, M>>;
    public routing<R = SimAtomic, M = any>(i: Intent | string, data?: any): Promise<RouterModule<R, M>> {
        if (i instanceof Intent) {
            return this.routerManager.routing<R, M>(i);
        } else {
            return this.routerManager.routing<R, M>(new Intent(i, data));
        }
    }
}
