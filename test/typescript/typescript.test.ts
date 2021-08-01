/* eslint-disable */
// import * as request from 'supertest'
// import {Index} from '@src/app/features/index'


export class A {

}
export class AA extends A {

}

export class B<T extends A> {
    constructor(public a: T) {
    }
}

export interface Z {
    nane: string;
}

export interface I {
    nane: string;
}

export interface II extends I {
    age: number;
    printAge(): void;
}

export class OI implements II {
    age: number;
    nane: string;
    constructor(age: number, nane: string) {
        this.age = age;
        this.nane = nane;
    }

    printAge(): void {
        console.log(this.age)
    }
}

describe('Test', () => {
    test('test', async (done) => {
        const a = new AA()
        new B(a);
        expect(200).toBe(200)
        done()
    })
    test('interface-test', async (done) => {
       const oi = new OI(1, '1');

        console.log(oi instanceof Object)
       // if (ObjectUtils.isPrototypeOfTarget(I.prototype, oi)) {
       //     console.log('implments')
       // }
        console.log(oi)
        expect(200).toBe(200)
        done()
    })
})

