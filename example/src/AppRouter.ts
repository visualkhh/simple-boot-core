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
        '/:aa/vv': [B, {b: 'zzzzz'}],
        '/users/vv': [B, {b: 'zz'}]
    },
    path: '',
    // routers: [UserRouter]
})
export class AppRouter implements RouterAction {


    constructor() {
    }


    async canActivate(url: Intent, module: any){
        // console.log('AppRouter canActivate->>>>>', url, module)
    }

    hasActivate(checkObj: any): boolean {
        return true;
    }
}
