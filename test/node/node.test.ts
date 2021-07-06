/* eslint-disable */
// import * as request from 'supertest'
// import {Index} from '@src/app/features/index'
import {URL} from 'url'

describe('Test', () => {
    test('test', async (done) => {
        let url = new URL('/asd/gg?a=66&g=55', 'http://naver.com');
        console.log('-->', 'good')
        expect(200).toBe(200)
        done()
    })
})

