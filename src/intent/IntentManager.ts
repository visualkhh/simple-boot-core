import 'reflect-metadata'
import {Intent} from './Intent';
import {SimstanceManager} from '../simstance/SimstanceManager';

export class IntentManager {
    constructor(public simstanceManager: SimstanceManager) {
    }

    public publish(it: string, data?: any): void;
    public publish(it: Intent, data?: any): void;
    public publish(it: Intent | string, data?: any): void {
        if (typeof it === 'string') {
            it = new Intent(it, data);
        }
        const intent = it as Intent;

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
                        orNewSim.call(callthis, intent);
                    } else if (orNewSim) {
                        callthis[lastProp] = intent.data;
                    }
                } else {
                    orNewSim?.intentSubscribe?.(intent);
                }
            }
        })
    }
}

// export const intentManager = new IntentManager();
