import {LifeCycle} from "./LifeCycle";
import {IntentEvent} from "../intent/IntentEvent";
import {Intent} from "../intent/Intent";
import {SimGlobal} from "../global/SimGlobal";

export type RefModuleItem = {dest?: any, params: any[], callBack: Function };

export class Module implements IntentEvent, LifeCycle {
    public _refModule = new Map<string, Map<Module, RefModuleItem[]> >();

    onCreate(): void {
    }

    publish(intent: Intent): void {
        SimGlobal().application?.publishIntent(intent);
    }

    subscribe(intent: Intent): void {
    }


}
