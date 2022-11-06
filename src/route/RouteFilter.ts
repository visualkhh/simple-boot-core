import {Intent} from '../intent/Intent';

export interface RouteFilter {
    isAccept(intent: Intent): boolean;
}
