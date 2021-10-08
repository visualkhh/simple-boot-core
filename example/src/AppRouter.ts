import { A } from './A';
import { B } from './B';
import { Router, RouterConfig, Sim, SimConfig } from 'simple-boot-core/decorators/SimDecorator';
import { Intent } from 'simple-boot-core/intent/Intent';
import { ConstructorType } from 'simple-boot-core/types/Types';
import { UserRouter } from './users/UserRouter';

@Sim()
@Router({
    route: {
        '': A,
        '/': A,
        '/b': B,
        '/b/:aa/vv': B
    },
    path: '',
    routers: [UserRouter]
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
