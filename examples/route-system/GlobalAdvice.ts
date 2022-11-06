import { Sim } from 'simple-boot-core/decorators/SimDecorator';
import { ExceptionHandler } from 'simple-boot-core/decorators/exception/ExceptionDecorator';

@Sim
export class GlobalAdvice {
    // @ExceptionHandler()
    // otherException(
    //     @Inject({situationType: ExceptionHandlerSituationType.ERROR_OBJECT}) e: any,
    //     @Inject({situationType: ExceptionHandlerSituationType.PARAMETER}) z: any,
    //         p: string
    // ) {
    //     console.log(`otherException: ${e.message} - -${z} ${p}`)
    // }

    @ExceptionHandler({type: Error})
    errorTypeException(e: Error) {
        console.log(`errorTypeException: ${e.message}-`)
    }
}
