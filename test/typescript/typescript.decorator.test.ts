// typescript decorator
// https://www.typescriptlang.org/docs/handbook/decorators.html#method-decorators
import {getRoutes, RouteMetadataKey} from '../../src/decorators/route/Router';
import {ExceptionHandler, getExceptionHandlers} from '../../src/decorators/exception/ExceptionDecorator';
import {ReflectUtils} from '../../src/utils/reflect/ReflectUtils';
import {Route} from '../../src/decorators/route/Router';
import {Router} from '../../src/decorators/route/Router';
import {getRouter} from '../../src/decorators/route/Router';

describe('typescript', () => {
    test('typescript decorator test', async (done) => {
        @Router({
            path: ''
        })
        class Test {
            @Route({path: '/test'})
            // @ExceptionHandler({type: Test})
            goo() {

            }
            @Route({path: '/test2'})
            // @ExceptionHandler({type: Test, throw: true})
            gosso() {

            }

            @Route({path: '/test2'})
            // @ExceptionHandler({type: Test, throw: true})
            goss2o() {

            }
        }

        const test = new Test();
        // const aa  = ReflectUtils.getOwnMetadata(ExceptionHandler, test);
        // const dd  = getExceptionHandlers(test); //ReflectUtils.getMetadata(RouteMetadataKey, test.constructor)
        let ownMetadata = getRouter(test);
        console.log('--->', ownMetadata);
        done()
        // setTimeout(() => {
        // }, 5000)

        // expect(20).toBe(20);
        // done()
    })
})
