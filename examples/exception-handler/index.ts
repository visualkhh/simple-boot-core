import {SimpleApplication} from 'simple-boot-core';
import {Router} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';
import {
    ExceptionHandler,
    ExceptionHandlerSituationType
} from 'simple-boot-core/decorators/exception/ExceptionDecorator';
import {Inject} from 'simple-boot-core/decorators/inject/Inject';
import {SimOption} from 'simple-boot-core/SimOption';

class GlobalError {
    constructor(public message: string) {
    }
}

@Sim()
class GlobalAdvice {
    @ExceptionHandler()
    otherException(@Inject({situationType: ExceptionHandlerSituationType.ERROR_OBJECT}) e: any) {
        console.log(`otherException : ${e.message}`)
    }

    @ExceptionHandler({type: Error})
    errorTypeException(e: Error) {
        console.log(`errorTypeException : ${e.message}`)
    }

    @ExceptionHandler({type: GlobalError})
    globalErrorTypeException(e: GlobalError) {
        console.log(`globalErrorTypeException : ${e.message}`)
    }
}



@Sim()
class User {
    // @ExceptionHandler({throw: true})
    // otherException(@Inject({situationType: ExceptionHandlerSituationType.ERROR_OBJECT}) e: any) {
    //     console.log(`otherException: ${e.message}`)
    // }

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

    globalError() {
        console.log('globalError call');
        throw new GlobalError('global');
    }
}
const option = new SimOption([GlobalAdvice])
const app = new SimpleApplication(option);
app.run().getOrNewSim(User).globalError();

// @Sim()
// @Router({
//     path: '',
//     route: {'/user': User}
// })
// class AppRouter {
// }

// const app = new SimpleApplication(AppRouter);
// app.run();
// app.routing('/user').then(it => {
//     const target = it.getModuleInstance<User>();
//     target.sayName();
//     target.sayAge();
// })