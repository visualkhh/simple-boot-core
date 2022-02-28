import {SimpleApplication} from 'simple-boot-core';
import {Router} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';

@Sim()
class User {
    say() {
        console.log('say~ hello');
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
    it.getModuleInstance<User>()?.say();
})