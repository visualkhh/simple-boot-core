import {User} from './User';
import {UserDetaile} from 'src/users/UserDetaile';
import { Router, RouterConfig } from 'simple-boot-core/decorators/route/Router';
import { RouterAction } from 'simple-boot-core/route/RouterAction';
import { Intent } from 'simple-boot-core/intent/Intent';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';

@Sim()
@Router({
    path: '/users',
    route: {
        '': User,
        '/': User,
        '/:no': User,
        '/:no/detaile': [UserDetaile, {name: 'zz'}],
    }
})
export class UserRouter {
    // canActivate(url: Intent, module: any): void {
    //     console.log('UserRouter canActivate', url, module)
    // }

}
