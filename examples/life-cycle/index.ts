import {SimpleApplication} from 'simple-boot-core';
import {Router} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';
import {OnSimCreate} from '../../src/lifecycle/OnSimCreate';

@Sim
class User implements OnSimCreate{
    name = 'old name';
    constructor() {
    }

    onSimCreate(): void {
        this.name = 'new name';
    }

    sayName() {
        console.log(this.name)
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
