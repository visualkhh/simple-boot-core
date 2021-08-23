import { Intent } from 'intent/Intent';
import { RouterModule } from 'route/RouterModule';
import { ConstructorType } from 'types/Types';

export interface RouterAction {

    canActivate(url: Intent, module: any): void;
    // notFound(url: Intent): ConstructorType<Object>;

        // public async canActivate(url: Intent, module: RouterModule): Promise<ConstructorType<Object> | undefined> {
//         return module.module;
//     }
//
//     public notFound(url: Intent): ConstructorType<Object> | undefined {
//         return undefined;
//     }
}
