import {SimpleApplication} from 'simple-boot-core';
import {Route, Router} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';
import {RouterAction} from 'simple-boot-core/route/RouterAction';
import {Intent} from 'simple-boot-core/intent/Intent';
import {OnRoute} from 'simple-boot-core/decorators/route/OnRoute';
import {RouterModule} from 'simple-boot-core/route/RouterModule';
import {SimOption} from 'simple-boot-core/SimOption';
import { Injection } from 'simple-boot-core/decorators/inject/Injection';
import { Inject } from 'simple-boot-core/decorators/inject/Inject';

@Sim
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

@Sim
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

@Sim
class Welcome {

    say() {
        console.log('welcome');
    }
}

@Sim
@Router({
    path: '',
    route: {'/welcome': Welcome},
    routers: [UsersRouter]
})
class AppRouter implements RouterAction {
    name = 'appRouter-name'

    @Injection
    @Route({path: ['/sub-route', '/ss', '/zz']})
    test(@Inject({disabled: true})props: string, simOption: SimOption) {
        console.log('test--', props, simOption, this.name);
    }

    async canActivate(url: Intent, module: any) {
        // console.log('activate route: ', url, module);
    }
}
const option = new SimOption();
const app = new SimpleApplication(AppRouter, option);
app.run();
(async() => {
    // route in router
    let routerModule = await app.routing('/sub-route');
    // console.log('---?', routerModule)
    let propertyKey = routerModule.propertyKeys?.[0];
    console.log('key-->', propertyKey);
    // let moduleInstance = routerModule.getModuleInstance<(props: string) => void>(propertyKey);
    // moduleInstance('propData');
    routerModule.executeModuleProperty(propertyKey);


    // route in router
    routerModule = await app.routing('/zz');
    propertyKey = routerModule.propertyKeys?.[0];
    routerModule.executeModuleProperty(propertyKey)

    // route in router
    routerModule = await app.routing('/ss');
    propertyKey = routerModule.propertyKeys?.[0];
    routerModule.executeModuleProperty(propertyKey)


    //
    // // router
    // (await app.routing('/welcome')).getModuleInstance<Welcome>().say();
    // (await app.routing('/users/office?name=newName')).getModuleInstance<Office>().sayName();
})();
