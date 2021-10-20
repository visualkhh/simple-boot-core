import { Intent } from './Intent';

export interface IntentSubscribe {
    intentSubscribe(intent: Intent): void;
}
