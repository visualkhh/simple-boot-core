import { Intent } from '../intent/Intent';

export interface RouterAction {
    canActivate(url: Intent, module: any): void;
}
