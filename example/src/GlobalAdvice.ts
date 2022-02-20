import {Sim} from "simple-boot-core/decorators/SimDecorator";
import {ExceptionHandler, ExceptionHandlerSituationType} from "simple-boot-core/decorators/exception/ExceptionDecorator";
import {Inject} from 'simple-boot-core/decorators/inject/Inject';

@Sim()
export class GlobalAdvice {

    constructor() {
    }

    @ExceptionHandler()
    print(@Inject({situationType: ExceptionHandlerSituationType.ERROR_OBJECT}) error : any) {
        console.log('global advice errorr', error);
        console.log('end-->')
    }

}
