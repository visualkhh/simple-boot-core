import {SimpleApplication} from 'simple-boot-core';
import {Router} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';
import {OnSimCreate} from '../../src/lifecycle/OnSimCreate';
import {After, Around, Before} from 'simple-boot-core/decorators/aop/AOPDecorator';

@Sim()
class User {

    @Before({property: 'sayName'})
    sayBefore() {
        console.log('sayBefore')
    }

    sayName() {
        console.log('My name is visualkhh');
    }

    @After({property: 'sayName'})
    sayAfter() {
        console.log('sayAfter')
    }
}

@Sim()
@Router({
    path: '',
    route: {'/user': User}
})
class AppRouter {
}

const app = new SimpleApplication(AppRouter);
app.run();
app.routing('/user').then(it => {
    it.getModuleInstance<User>().sayName();
})