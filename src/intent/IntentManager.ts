import { Intent, PublishType } from './Intent';
import {SimstanceManager} from '../simstance/SimstanceManager';

export class IntentManager {
    constructor(public simstanceManager: SimstanceManager) {
    }

    public publish(it: string, data?: any): any[];
    public publish(it: Intent): any[];
    public publish(it: Intent | string, data?: any): any[] {
        if (typeof it === 'string') {
            it = new Intent(it, data);
        }
        const intent = it as Intent;
        const r: any[] = [];
        const target = intent.scheme ? this.simstanceManager.getSimConfig(intent.scheme) : this.simstanceManager.getSimAtomics();
        target.forEach((data) => {
            let orNewSim = this.simstanceManager?.getOrNewSim(data.type) as any;
            if (orNewSim) {
                if (intent.paths.length > 0) {
                    let callthis = orNewSim;
                    let lastProp = '';
                    intent.paths.filter(i => i).forEach(i => {
                        callthis = orNewSim;
                        orNewSim = orNewSim?.[i]
                        lastProp = i;
                    });
                    if (orNewSim && typeof orNewSim === 'function') {
                        if (PublishType.DATA_PARAMETERS === intent.publishType) {
                            r.push(orNewSim.call(callthis, intent.data));
                        } else if (PublishType.INLINE_DATA_PARAMETERS === intent.publishType) {
                            r.push(orNewSim.call(callthis, ...intent.data));
                        } else {
                            r.push(orNewSim.call(callthis, intent));
                        }
                    } else if (orNewSim) {
                        callthis[lastProp] = intent.data;
                        r.push(callthis[lastProp]);
                    }
                } else {
                    if (PublishType.DATA_PARAMETERS === intent.publishType) {
                        r.push(orNewSim?.intentSubscribe?.(intent.data));
                    } else if (PublishType.INLINE_DATA_PARAMETERS === intent.publishType) {
                        r.push(orNewSim?.intentSubscribe?.(...intent.data));
                    } else {
                        r.push(orNewSim?.intentSubscribe?.(intent));
                    }
                }
            }
        })
        return r;
    }
}
