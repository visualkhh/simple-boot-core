import 'reflect-metadata'
import {Intent} from './Intent';
import {SimstanceManager} from '../simstance/SimstanceManager';

export class IntentManager {
    constructor(public simstanceManager: SimstanceManager) {
    }

    public publish(it: Intent) {
        this.simstanceManager.getSimConfig(it.scheme).forEach((data) => {
            let orNewSim = this.simstanceManager?.getOrNewSim(data.type) as any;
            if (orNewSim) {
                // console.log('-->', orNewSim, it.paths)
                if (it.paths.length > 0) {
                    let callthis = orNewSim;
                    let lastProp = '';
                    it.paths.filter(i => i).forEach(i => {
                        callthis = orNewSim;
                        orNewSim = orNewSim?.[i]
                        lastProp = i;
                    });
                    if (orNewSim && typeof orNewSim === 'function') {
                        orNewSim.call(callthis, it);
                    } else if (orNewSim) {
                        callthis[lastProp] = it.data;
                    }
                } else {
                    orNewSim?.subscribe?.(it);
                }
            }
        })
    }
}

// export const intentManager = new IntentManager();
