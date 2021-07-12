/* eslint-disable */
// import * as request from 'supertest'
// import {Index} from '@src/app/features/index'


describe('Test', () => {
    test('urlExpression', async (done) => {
        // const url = '/asdasd/ggg/zz/ac/vv/zzz/sd/vv';
        // const urlExpression = '/asdasd/:ff/zz/ac/:asd/:zz/sd/:gff';
        const url =             '/asdasd/ggg/zz/ac/vv/zzz/sd/vv';
        const urlExpression =   '/asdasd/ggg/zz/ac/vv/zzz/sd/:gff';
        const urls = url.split('/');
        const urlExpressions = urlExpression.split('/');
        const data: {[name: string]: any } = {}
        for (let i = 0; i < urlExpressions.length; i++) {
            const it = urlExpressions[i];
            const urlit = urls[i];
            if (!it.startsWith(':')) {
                if (it !== urlit) {
                    break;
                }
                continue;
            }
            data[it.slice(1)] = urlit;
        }
        console.log(data)
        // console.log(urls, urlExpressions)

        expect(200).toBe(200)
        done()
    })
    test('test', async (done) => {
        const regex = '(:[a-zA-Z_$][a-zA-Z_.$0-9]*)';
        const url = '/asdasd/:ff/zz/ac/:asd/:zz/sd/:ff';
        const origin = RegExp(regex, 'gm')
        let originExec = origin.exec(url);
        while (originExec) {
            // const s = originExec[1].split('.')
            // for (let i = 1; i <= s.length; i++) {
            //     const tail = s.slice(s.length - i, s.length - i + 1)
            //     const front = s.slice(0, s.length - i)
            //     console.log('--->', front, tail)
            //
            // }
            console.log('-->', originExec[1])
            originExec = origin.exec(originExec.input)
        }
        expect(200).toBe(200)
        done()
    })
})

