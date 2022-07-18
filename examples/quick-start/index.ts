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
// type 1
app.run();
app.sim(User).say();

// type 2
// app.run().getOrNewSim(User).say();

// type 3
// app.run();
// const atomic = app.simAtomic(User);
// atomic.value.say();

// type 4 routing
// app.run();
// app.routing('/user').then(it => {
//     it.getModuleInstance<User>()?.say();
// })

