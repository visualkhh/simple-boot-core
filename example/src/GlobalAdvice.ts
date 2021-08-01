import {Sim} from "simple-boot-core/decorators/SimDecorator";
import {ExceptionHandler} from "simple-boot-core/decorators/exception/ExceptionDecorator";

@Sim()
export class GlobalAdvice {

    constructor() {
    }

    @ExceptionHandler()
    print(error: any){
        console.log('global advice errorr', error.msg)
    }

}
