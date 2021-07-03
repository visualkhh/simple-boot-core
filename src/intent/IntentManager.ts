import 'reflect-metadata'
import {AsyncSubject, fromEvent, Subject} from 'rxjs';
import {Intent} from './Intent';
import {ConstructorType} from '../types/Types';
import {SimstanceManager} from '../simstance/SimstanceManager';
import {Runnable} from '../run/Runnable';

export class IntentManager implements Runnable {
    public subject = new Subject<Intent>()
    constructor(public simstanceManager: SimstanceManager) {
    }

    onNext(intent: Intent) {
       this.subject.next(intent);
    }

    public run() {
        this.subject.subscribe(it => {
            this.simstanceManager?.getSimConfig(it.scheme).forEach((data) => {
                this.extracted(data.type, it);
            })
        });
    }

    private extracted(key: ConstructorType<any>, it: Intent) {
        let orNewSim = this.simstanceManager?.getOrNewSim(key) as any;
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
    }
}

// export const intentManager = new IntentManager();
