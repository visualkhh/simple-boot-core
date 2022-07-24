// typescript decorator
// https://www.typescriptlang.org/docs/handbook/decorators.html#method-decorators
import {getRoutes, RouteMetadataKey} from '../../src/decorators/route/Router';
import {ExceptionHandler, getExceptionHandlers} from '../../src/decorators/exception/ExceptionDecorator';
import {ReflectUtils} from '../../src/utils/reflect/ReflectUtils';
import {Route} from '../../src/decorators/route/Router';
import {Router} from '../../src/decorators/route/Router';
import {getRouter} from '../../src/decorators/route/Router';
import {ConstructorType, GenericClassDecorator} from '../../src/types/Types';
import {SimConfig, SimMetadataKey, sims} from '../../src/decorators/SimDecorator';

describe('typescript', () => {
    test('typescript class decorator test', async (done) => {

        // function add(first: number, second: number): number;    //Overload signature with two parameters
        // function add(first: number, second: number, third:number): number;  //Overload signature with three parameters
        // function add(first: number, second: number, third?: number, fourth?: number): number {  //Implementation signature
        //     if (first !== undefined && second !== undefined && third !== undefined) {
        //         return first + second + third;
        //     } else {
        //         return first + second;
        //     }
        // }

        function Sim(target: ConstructorType<any>): void;
        function Sim(target: any): ((target: ConstructorType<any>)=>void);
        function Sim(target: ConstructorType<any> | any): void | ((target: ConstructorType<any>)=>void)  {
                console.log('--22')
                return (target: ConstructorType<any>) => {
                    console.log('--2222', target)
                }
        }

        // function Sim(target: GenericClassDecorator<ConstructorType<any>>): void;
        // function Sim (config:  ConstructorType<any> | any): void | GenericClassDecorator<ConstructorType<any>>  {
        //     if (typeof config === 'function') {
        //         console.log('--')
        //     }
        //     // @ts-ignore
        //     return (target: ConstructorType<any>) => {
        //         console.log('--22')
        //         ReflectUtils.defineMetadata(SimMetadataKey, config, target);
        //         sims.add(target);
        //     }
        // }
        // const Sim = (target: ConstructorType<any>) => {
        //     ReflectUtils.defineMetadata(SimMetadataKey, config, target);
        //     sims.add(target);
        // }

        @Sim
        class WOW {

        }

        @Sim({})
        class WOWS {

        }
        done()

    })
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
