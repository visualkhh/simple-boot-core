import {SimpleApplication} from 'simple-boot-core';
import {Router} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';
import {
    ExceptionHandler,
    ExceptionHandlerSituationType
} from 'simple-boot-core/decorators/exception/ExceptionDecorator';
import {Inject} from 'simple-boot-core/decorators/inject/Inject';
import {SimOption} from 'simple-boot-core/SimOption';
import {After, Before} from 'simple-boot-core/decorators/aop/AOPDecorator';

class Param {
    name = 'ss'
}

@Sim
class User {
    sayName(name: string, p: Param) {
        console.log('My name is visualkhh' + name);
        throw new Error('error');
    }

    sayAge() {
        console.log('age 5');
        throw new Error('age error');
    }

    @ExceptionHandler({throw: true})
    sayNameException() {
        console.log('-----!@#!@#----')
    }
}

@Sim
@Router({
    path: '',
    route: {'/user': User}
})
class AppRouter {
}

@Sim
class GlobalAdvice {
    // @ExceptionHandler()
    // otherException(
    //     @Inject({situationType: ExceptionHandlerSituationType.ERROR_OBJECT}) e: any,
    //     @Inject({situationType: ExceptionHandlerSituationType.PARAMETER}) z: any,
    //         p: string
    // ) {
    //     console.log(`otherException: ${e.message} - -${z} ${p}`)
    // }

    @ExceptionHandler({type: Error})
    errorTypeException(e: Error, s: string, @Inject({situationType: ExceptionHandlerSituationType.PARAMETER}) z: any) {
        console.log(`errorTypeException: ${e.message}--${z}-${s}`)
    }


    @Before({type: User, property: 'sayName'})
    sayBefore() {
        console.log('sayBefore')
    }


    @After({type: User, property: 'sayName'})
    sayAfter() {
        console.log('sayAfter')
    }
}

const option = new SimOption();
option.advice = [GlobalAdvice];
const app = new SimpleApplication(AppRouter, option);
app.run();
app.routing('/user').then(it => {
    const target = it.getModuleInstance<User>();
    target.sayName('good', new Param());
    // target.sayAge();
})
