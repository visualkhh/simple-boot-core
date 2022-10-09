// typescript decorator
// https://www.typescriptlang.org/docs/handbook/decorators.html#method-decorators
import 'reflect-metadata'
import {ReflectUtils} from '../../dist/utils/reflect/ReflectUtils';
import {Sim} from '../../src/decorators/SimDecorator';

describe('typescript', () => {
    test('typescript class decorator test', async (done) => {
        function logType(type: any) {
            return function(target: any, propertyKey: string) {
                Reflect.defineMetadata('design:type', type, target, propertyKey);
            }
        }
        @Sim
        class Demo {
            constructor(a: any) {
            }

            // @logType(Array) // add parentheses
            test: Date[] | undefined;
        }
        const demo = new Demo([new Date()]);
        const a = Reflect.getMetadata('design:paramtypes', Demo)

        // const a = ReflectUtils.getType(new Demo(), 'test');
        console.log('-->', a);
        console.log('-->', a[0] === Array);
        done();
    })
})
