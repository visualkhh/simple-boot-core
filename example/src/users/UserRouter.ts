import {User} from './User';
import {UserDetaile} from 'src/users/UserDetaile';
import { Router, RouterConfig, Sim } from 'simple-boot-core/decorators/SimDecorator';
import { A } from 'src/A';
import { B } from 'src/B';

@Sim()
@Router({
    childs: {
        '': User,
        '/': User,
        '/:no': User,
        '/:no/detaile': UserDetaile,
    },
    path: '/users'
})
export class UserRouter{

}
