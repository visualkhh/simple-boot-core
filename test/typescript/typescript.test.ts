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
describe('Test', () => {
    test('test', async (done) => {
        const a = new AA()
        new B(a);
        expect(200).toBe(200)
        done()
    })
})

