import {SimpleApplication} from 'simple-boot-core';
import {Router} from 'simple-boot-core/decorators/route/Router';
import { Lifecycle, PostConstruct, Sim } from 'simple-boot-core/decorators/SimDecorator';
import {Inject} from 'simple-boot-core/decorators/inject/Inject';

@Sim
class User {
    say() {
        console.log('User say');
    }
}

@Sim({scheme: 'User'})
class User1 {
    say() {
        console.log('User1 say');
    }
}

@Sim({type: User})
class User2 {
    say() {
        console.log('User2 say');
    }
}

@Sim({
    scope: Lifecycle.Transient
})
@Router({
    path: '',
    route: {'/user': User}
})
 abstract class AppRouter {
    private date = new Date().toISOString();
    constructor(@Inject({type: User, scheme: 'User'}) private users: User[]) {
        console.log('users-->constructor-!!!!', users);
        users.forEach(it => {
            it.say();
        })
        // this.user.say();
    }

    routeSay() {
        console.log('routerSay', this.date);
    }
  @PostConstruct
  post() {
    console.log('---------22-postConstruct')
  }
}
@Sim({
  type: AppRouter,
  scope: Lifecycle.Transient
})
class AppRouter2 extends AppRouter {
    constructor(@Inject({type: User, scheme: 'User'}) users: User[]) {
        super(users);
    }

  routeSay() {
    console.log('routerSay!!!!!!!');
  }


}

const app = new SimpleApplication(AppRouter);
// type 1
app.run();
// const a = app.simAtomic(AppRouter)
// console.log('---->',a)
// const c = a.getConfig()
// console.log('---->',c)
// app.sim(User).say();
let appRouter = app.sim(AppRouter);
// console.log('!!!', appRouter)
appRouter?.routeSay();

// appRouter = app.sim(AppRouter);
// appRouter?.routeSay();
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
