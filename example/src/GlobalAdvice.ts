import {Module} from 'simple-boot-core/module/Module';
import {Sim} from "simple-boot-core/decorators/SimDecorator";
import {ExceptionHandler} from "simple-boot-core/decorators/exception/ExceptionDecorator";

@Sim()
export class GlobalAdvice extends Module {

    constructor() {
        super();
    }

    @ExceptionHandler()
    print(error: any){
        console.log('global advice errorr', error.msg)
    }

}
