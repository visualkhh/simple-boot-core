import {ConstructorType} from '../../types/Types';

export class ObjectUtils {
    static getAllProtoTypeName(target?: any): string[] {
        let data: string[] = [];
        if (target) {
            const proto = Object.getPrototypeOf(target);
            if (proto && (data = Object.keys(proto) || []).length > 0) {
                data = data.concat(this.getAllProtoTypeName(proto))
            }
        }
        return data.filter(it => it !== 'constructor');
    }

    static getProtoTypeName(target?: any): string[] {
        let data: string[] = [];
        if (target) {
            const proto = Object.getPrototypeOf(target);
            data = Object.keys(proto) || []
        }
        return data.filter(it => it !== 'constructor');
    }

    static getProtoTypes(target?: any): Function[] {
        const data: Function[] = [];
        if (target) {
            const proto = Object.getPrototypeOf(target);
            (Object.keys(proto) || []).filter(it => it !== 'constructor').forEach(it => {
                data.push(proto[it])
            })
        }
        return data;
    }

    static seal<T>(target: T): T {
        return Object.seal(target);
    }

    // static isAssignableFrom(start: ConstructorType<any>, target: ConstructorType<any>) {
    //     return this.getAllProtoType(target).includes(start);
    // }

    /*
    Object.prototype.isPrototypeOf()
    isPrototypeOf() 메소드는 해당 객체가 다른 객체의 프로토타입 체인에 속한 객체인지 확인하기 위해 사용됩니다.
     */
    static isPrototypeOfTarget(start: ConstructorType<any> | null | undefined, target: any | null | undefined): boolean {
        if (start && target) {
            return Object.prototype.isPrototypeOf.call(start.prototype, target);
        } else {
            return false;
        }
    }
    static getPrototypeOfDepth(target: any, dest: ConstructorType<any> | null | undefined): object[] {

        let object = target;
        const r = [];
        // if (includeMe) {
        //     r.push(Object.getPrototypeOf(object));
        // }
        if (dest) {
            do {
              object = Object.getPrototypeOf(object);
              if (object?.constructor === dest) {
                  break;
              }
              r.push(object);
              // console.log(object);
            } while (object);
        }
        return r;
    }

    static getAllProtoType(start: ConstructorType<any> | null | undefined): ConstructorType<any>[] {
        // if (typeof start === 'object') {
        //     start = Object.getPrototypeOf(start);
        // }
        const protos: ConstructorType<any>[] = []
        while (start) {
            protos.push(start);
            start = Object.getPrototypeOf(start)
        }
        return protos;
    }

    static getPrototypeOf(start: any) {
        return Object.getPrototypeOf(start);
    }

    static getPrototypeKeyMap(target: any): Map<Function, string> {
        const data = new Map<Function, string>();
        const proto = Object.getPrototypeOf(target);
        (Object.keys(proto) || []).filter(it => it !== 'constructor').forEach(it => {
            data.set(proto[it], it)
        })
        return data;
    }

    static getPrototypeName(target: any, fnc: Function): string | undefined {
        return this.getPrototypeKeyMap(target).get(fnc)
    }

    // static getObjectKeyValue() {
    //     for(const [key, value] of Object.entries(rtnAttribute)) {
    //         it.setAttribute(key, value);
    //     }
    // }

    /* prototype 상속 처리하기
        class A {
            say() {
                console.log('say')
            }
        }

        class B {
            wow() {
                console.log('wow')
            }
        }

        const a = new A();
        const b = new B();

        const c = Object.assign(a, b);
        console.log(a, b, c);


        const zz = Object.setPrototypeOf(A.prototype, B.prototype);
        console.log(zz)
        new A().wow();
    *  */
}
