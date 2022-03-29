import {Runnable} from './run/Runnable';
import {SimstanceManager} from './simstance/SimstanceManager';
import {SimOption} from './SimOption';
import {IntentManager} from './intent/IntentManager';
import {RouterManager} from './route/RouterManager';
import {Intent} from './intent/Intent';
import {ConstructorType} from './types/Types';
import {RouterModule} from './route/RouterModule';
import {SimAtomic} from './simstance/SimAtomic';
import 'reflect-metadata'

export class SimpleApplication {
    public simstanceManager: SimstanceManager;
    public intentManager: IntentManager;
    public routerManager: RouterManager;

    constructor(public rootRouter: ConstructorType<Object>, public option = new SimOption()) {
        this.simstanceManager = new SimstanceManager(option)
        this.simstanceManager.storage.set(SimpleApplication, this);
        this.intentManager = new IntentManager(this.simstanceManager);
        this.routerManager = new RouterManager(this.simstanceManager, this.rootRouter);
        this.simstanceManager.storage.set(SimstanceManager, this.simstanceManager);
        this.simstanceManager.storage.set(IntentManager, this.intentManager);
        this.simstanceManager.storage.set(RouterManager, this.routerManager);
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

    public routing<R = SimAtomic, M = any>(i: string, data?: any): Promise<RouterModule>;
    public routing<R = SimAtomic, M = any>(i: Intent): Promise<RouterModule>;
    public routing<R = SimAtomic, M = any>(i: Intent | string, data?: any): Promise<RouterModule> {
        if (i instanceof Intent) {
            return this.routerManager.routing(i);
        } else {
            return this.routerManager.routing(new Intent(i, data));
        }
    }
}
