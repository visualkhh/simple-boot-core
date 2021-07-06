import {LifeCycle} from "./LifeCycle";
import {IntentEvent} from "../intent/IntentEvent";
import {Intent} from "../intent/Intent";
import {SimGlobal} from "../global/SimGlobal";

export type RefModuleItem = {dest?: any, params: any[], callBack: Function };

export class Module implements IntentEvent, LifeCycle {
    public _refModule = new Map<string, Map<Module, RefModuleItem[]> >();

    onChangedRender(): void {
    }

    onFinish(): void {
    }

    onInit(): void {
    }

    onInitedChild(): void {
    }

    publish(intent: Intent): void {
        SimGlobal().application?.publishSimIntent(intent);
    }

    subscribe(intent: Intent): void {
    }


}
