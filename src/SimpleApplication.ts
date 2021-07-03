import {SimGlobal} from './global/SimGlobal';
import {Runnable} from './run/Runnable';
import {SimstanceManager} from "./simstance/SimstanceManager";
import {SimOption} from "./SimOption";
import {IntentManager} from "./intent/IntentManager";

export class SimpleApplication implements Runnable {
    public simstanceManager: SimstanceManager;
    public intentManager: IntentManager;
    constructor(public option: SimOption) {
        this.simstanceManager = new SimstanceManager(option)
        this.intentManager = new IntentManager(this.simstanceManager);
        SimGlobal().application = this;
    }

    public run() {
        this.simstanceManager.run();
        this.intentManager.run();
    }
}
