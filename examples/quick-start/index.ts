import {SimpleApplication} from 'simple-boot-core';
import {Router} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';
import {Inject} from 'simple-boot-core/decorators/inject/Inject';

@Sim
class User {
    say() {
        console.log('say~ hello');
    }
}

@Sim({type: User})
class User2 {
    say() {
        console.log('say22~ hello');
    }
}

@Sim
@Router({
    path: '',
    route: {'/user': User}
})
class AppRouter {

    // constructor(private user: User) {
    //     this.user.say();
    // }
    constructor(@Inject({type: User}) private users: User[]) {
        console.log('users-->', users);
        users.forEach(it => {
            it.say();
        })
        // this.user.say();
    }

    routeSay() {
        console.log('routerSay');
    }
}

const app = new SimpleApplication(AppRouter);
// type 1
app.run();
// app.sim(User).say();
app.sim(AppRouter)?.routeSay();
// ssd  ssd
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
