import {SimGlobal} from './global/SimGlobal';
import {Runnable} from './run/Runnable';
import {SimstanceManager} from './simstance/SimstanceManager';
import {SimOption} from './SimOption';
import {IntentManager} from './intent/IntentManager';
import {RouterManager} from './route/RouterManager';
import {Intent} from './intent/Intent';
import {ConstructorType} from './types/Types';
import {RouterModule} from './route/RouterModule';
import { SimAtomic } from 'simstance/SimAtomic';

export class SimpleApplication implements Runnable {
    public simstanceManager: SimstanceManager;
    private intentManager: IntentManager;
    private routerManager: RouterManager;
    constructor(public rootRouter: ConstructorType<Object>, public option = new SimOption()) {
        this.simstanceManager = new SimstanceManager(option)
        this.intentManager = new IntentManager(this.simstanceManager);
        this.routerManager = new RouterManager(this.rootRouter);
        this.simstanceManager.storage.set(SimstanceManager, this.simstanceManager);
        this.simstanceManager.storage.set(IntentManager, this.intentManager);
        this.simstanceManager.storage.set(RouterManager, this.routerManager);
        SimGlobal().application = this;
    }

    public run() {
        this.simstanceManager.run();
    }

    public publishIntent(i: Intent) {
        return this.intentManager.publish(i);
    }

    public async routing<R = SimAtomic, M = any>(i: Intent) {
        const promise = await this.routerManager.routing(i);
        return promise as RouterModule<R, M> | undefined;
    }
}
