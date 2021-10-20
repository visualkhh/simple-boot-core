import {User} from './User';
import {UserDetaile} from 'src/users/UserDetaile';
import { Router, RouterConfig, Sim } from 'simple-boot-core/decorators/SimDecorator';
import { RouterAction } from 'simple-boot-core/route/RouterAction';
import { Intent } from 'simple-boot-core/intent/Intent';

@Sim()
@Router({
    route: {
        '': User,
        '/': User,
        '/:no': User,
        '/:no/detaile': [UserDetaile, {name: 'zz'}],
    },
    path: '/users'
})
export class UserRouter {
    // canActivate(url: Intent, module: any): void {
    //     console.log('UserRouter canActivate', url, module)
    // }

}
