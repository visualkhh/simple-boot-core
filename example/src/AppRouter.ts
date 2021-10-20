import { A } from './A';
import { B } from './B';
import { Router, Sim } from 'simple-boot-core/decorators/SimDecorator';
import { Intent } from 'simple-boot-core/intent/Intent';
import { UserRouter } from './users/UserRouter';
import { RouterAction } from 'simple-boot-core/route/RouterAction';

@Sim()
@Router({
    route: {
        '': '/',
        '/': [A, {a: 123}],
        '/b': B,
        '/b/:aa/vv': [B, {b: 'zzzzz'}]
    },
    path: '',
    routers: [UserRouter]
})
export class AppRouter implements RouterAction {


    constructor() {
    }


    canActivate(url: Intent, module: any): void {
        console.log('AppRouter canActivate->>>>>', url, module)
    }
}
