import {SimpleApplication} from 'simple-boot-core';
import {Router} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';
import {
    ExceptionHandler,
    ExceptionHandlerSituationType
} from 'simple-boot-core/decorators/exception/ExceptionDecorator';
import {Inject} from 'simple-boot-core/decorators/inject/Inject';

@Sim()
class User {

    @ExceptionHandler()
    otherException(@Inject({situationType: ExceptionHandlerSituationType.ERROR_OBJECT}) e: any) {
        console.log(`otherException: ${e.message}`)
    }

    @ExceptionHandler({type: Error})
    errorTypeException(e: Error) {
        console.log(`errorTypeException: ${e.message}`)
    }

    sayName() {
        console.log('My name is visualkhh');
        throw new Error('error');
    }

    sayAge() {
        console.log('age 5');
        throw {message: 'age error'};
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
    const target = it.getModuleInstance<User>();
    target.sayName();
    target.sayAge();
})