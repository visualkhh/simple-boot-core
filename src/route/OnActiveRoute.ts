import { RouterModule } from '../route/RouterModule';

export interface OnActiveRoute {
    onActiveRoute(r: RouterModule): void;
}
