import {SimpleApplication} from 'simple-boot-core';
import {Router} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';
import {Intent, PublishType} from 'simple-boot-core/intent/Intent';

@Sim({scheme:'User'})
class User {


    sayName(intent: Intent) {
        console.log(intent.queryParams.name);
        return 'from User'
    }

    sayAge(intent: Intent) {
        console.log(intent.data.age);
    }


    sayFullName(first: string, last: string) {
        console.log(`${first} ${last}`);
    }

}

@Sim()
@Router({
    path: '',
    route: {'/user': User}
})
class AppRouter {
    sayName(intent: Intent) {
        console.log(`appRouter name: ${intent.queryParams.name}`)
        return 'from AppRouter'
    }
}

const app = new SimpleApplication(AppRouter);
app.run();
app.publishIntent('User://sayName?name=newName');
app.publishIntent('User://sayAge', {age: 99});

const intent = new Intent('User://sayFullName', ['first', 'last'])
intent.publishType = PublishType.INLINE_DATA_PARAMETERS;
app.publishIntent(intent);

// broadcast
const result = app.publishIntent('://sayName?name=broadcastName');
console.log(`result: ${result}`);
