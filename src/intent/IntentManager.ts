import 'reflect-metadata'
import {Intent} from './Intent';
import {SimstanceManager} from '../simstance/SimstanceManager';

export class IntentManager {
    constructor(public simstanceManager: SimstanceManager) {
    }

    public publish(it: string, data?: any): any[];
    public publish(it: Intent, data?: any): any[];
    public publish(it: Intent | string, data?: any): any[] {
        if (typeof it === 'string') {
            it = new Intent(it, data);
        }
        const intent = it as Intent;
        const r: any[] = [];
        this.simstanceManager.getSimConfig(intent.scheme).forEach((data) => {
            let orNewSim = this.simstanceManager?.getOrNewSim(data.type) as any;
            if (orNewSim) {
                // console.log('-->', orNewSim, it.paths)
                if (intent.paths.length > 0) {
                    let callthis = orNewSim;
                    let lastProp = '';
                    intent.paths.filter(i => i).forEach(i => {
                        callthis = orNewSim;
                        orNewSim = orNewSim?.[i]
                        lastProp = i;
                    });
                    if (orNewSim && typeof orNewSim === 'function') {
                        r.push(orNewSim.call(callthis, intent));
                    } else if (orNewSim) {
                        callthis[lastProp] = intent.data;
                        r.push(callthis[lastProp]);
                    }
                } else {
                    r.push(orNewSim?.intentSubscribe?.(intent));
                }
            }
        })
        return r;
    }
}

// export const intentManager = new IntentManager();
