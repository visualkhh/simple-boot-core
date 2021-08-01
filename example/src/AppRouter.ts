import { A } from './A';
import { B } from './B';
import { Router, RouterConfig, Sim, SimConfig } from 'simple-boot-core/decorators/SimDecorator';
import { Intent } from 'simple-boot-core/intent/Intent';
import { ConstructorType } from 'simple-boot-core/types/Types';
import { UserRouter } from './users/UserRouter';

@Sim()
@Router({
    childs: {
        '': A,
        '/': A,
        '/b': B,
        '/b/:aa/vv': B
    },
    path: '',
    childRouters: [UserRouter]
})
export class AppRouter {


    constructor() {
    }

    notFound(url: Intent): ConstructorType<Object> | undefined {
        console.log('notfound--->');
        return undefined
        // return super.notFound(url);
    }
}
