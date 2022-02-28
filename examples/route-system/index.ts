import {SimpleApplication} from 'simple-boot-core';
import {Router} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';
import {RouterAction} from 'simple-boot-core/route/RouterAction';
import {Intent} from 'simple-boot-core/intent/Intent';
import {OnRoute} from 'simple-boot-core/decorators/route/OnRoute';
import {RouterModule} from 'simple-boot-core/route/RouterModule';

@Sim()
class Office {
    name = 'oldName'
    sayName() {
        console.log(`My office Name is ${this.name}`);
    }

    @OnRoute({isActivateMe: true})
    onRoute(routeModule: RouterModule) {
        console.log('onRoute');
        this.name = routeModule.queryParams.name;
    }
}

@Sim()
@Router({
    path: '/users',
    route: {'/office': Office}
})
class UsersRouter implements RouterAction {
    child: any;
    async canActivate(url: Intent, module: any){
        this.child = module;
    }

    hasActivate(checkObj: any): boolean {
        return this.child === checkObj;
    }
}



@Sim()
class Welcome {

    say() {
        console.log('welcome');
    }
}

@Sim()
@Router({
    path: '',
    route: {'/welcome': Welcome},
    routers: [UsersRouter]
})
class AppRouter implements RouterAction {

    async canActivate(url: Intent, module: any) {
        console.log('activate route: ', url, module);
    }


}

const app = new SimpleApplication(AppRouter);
app.run();
(async() => {
    (await app.routing('/welcome')).getModuleInstance<Welcome>().say();
    (await app.routing('/users/office?name=newName')).getModuleInstance<Office>().sayName();
})();
