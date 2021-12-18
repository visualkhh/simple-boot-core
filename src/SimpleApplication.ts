import { Runnable } from './run/Runnable';
import { SimstanceManager } from './simstance/SimstanceManager';
import { SimOption } from './SimOption';
import { IntentManager } from './intent/IntentManager';
import { RouterManager } from './route/RouterManager';
import { Intent } from './intent/Intent';
import { ConstructorType } from './types/Types';
import { RouterModule } from './route/RouterModule';
import { SimAtomic } from './simstance/SimAtomic';
import "reflect-metadata"
export class SimpleApplication implements Runnable {
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

    public run() {
        this.simstanceManager.run();
    }

    public publishIntent(i: Intent):any[] {
        return this.intentManager.publish(i);
    }

    public routing<R = SimAtomic, M = any>(i: Intent) {
        return this.routerManager.routing(i);
    }
}
