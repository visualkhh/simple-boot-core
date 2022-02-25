import { A } from './A';
import { B } from './B';
import { Router } from 'simple-boot-core/decorators/route/Router';
import { Intent } from 'simple-boot-core/intent/Intent';
import { UserRouter } from './users/UserRouter';
import { RouterAction } from 'simple-boot-core/route/RouterAction';
import {Route} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';
import {ProjectService} from './services/ProjectService';
import {Injection} from 'simple-boot-core/decorators/inject/Injection';
import {UserSim} from './model/UserSim';

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

    @Injection()
    @Route({path: '/goodjob'})
    test(project: ProjectService,  user: UserSim) {
        console.log('----------->goodjob'+ user.name)
        // return 10;
        return project.calc(5,55);
    }

    async canActivate(url: Intent, module: any){
        // console.log('AppRouter canActivate->>>>>', url, module)
    }

    hasActivate(checkObj: any): boolean {
        return true;
    }
}
