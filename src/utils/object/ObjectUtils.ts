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

    static getOwnPropertyNames(target?: any): string[] {
        const data: string[] = [];
        if (target) {
            if (!target.prototype) {
                const a = Object.getPrototypeOf(target);
                data.push(...Object.getOwnPropertyNames(a));
            } else {
                data.push(...Object.getOwnPropertyNames(Object.getPrototypeOf(target)));
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

    /*
    Object.prototype.isPrototypeOf()
    isPrototypeOf() 메소드는 해당 객체가 다른 객체의 프로토타입 체인에 속한 객체인지 확인하기 위해 사용됩니다.
     */
    static isPrototypeOfTarget(start: ConstructorType<any> | Function | null | undefined, target: any | null | undefined): boolean {
        if (start && target) {
            return Object.prototype.isPrototypeOf.call(start.prototype, target);
        } else {
            return false;
        }
    }

    static getPrototypeOfDepth(target: any, dest: ConstructorType<any> | Function | null | undefined): object[] {
        let object = target;
        const r = [];
        if (dest) {
            do {
                object = Object.getPrototypeOf(object);
                if (object?.constructor === dest) {
                    break;
                }
                r.push(object);
            } while (object);
        }
        return r;
    }

    static getAllProtoType(start: ConstructorType<any> | Function): (ConstructorType<any> | Function)[] {
        const depth = (target:  ConstructorType<any> | Function,  bowl: (ConstructorType<any> | Function)[] = []) => {
            if (target.prototype) {
                bowl.push(target);
                depth(Object.getPrototypeOf(target), bowl);
            }
            return bowl;
        }
        const d = depth(start);
        return d;
        // const protos: (ConstructorType<any> | Function)[] = []
        // while (start) {
        //     protos.push(start);
        //     start = Object.getPrototypeOf(start)
        // }
        // return protos;
    }

    static getPrototypeOf(start: any) {
        return Object.getPrototypeOf(start);
    }

    static getPrototypeKeyMap(target: any): Map<Function, string> {
        const data = new Map<Function, string>();
        if (target) {
            const proto = Object.getPrototypeOf(target);
            (Object.keys(proto) || []).filter(it => it !== 'constructor').forEach(it => {
                data.set(proto[it], it)
            })
        }
        return data;
    }

    static getPrototypeName(target: any, fnc: Function): string | undefined {
        return this.getPrototypeKeyMap(target).get(fnc)
    }

}
