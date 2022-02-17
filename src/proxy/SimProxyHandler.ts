import {SimstanceManager} from '../simstance/SimstanceManager'
import {getProtoAfters, getProtoBefores} from '../decorators/aop/AOPDecorator';
import {ObjectUtils} from '../utils/object/ObjectUtils';
import {SimOption} from '../SimOption';
import {targetExceptionHandler} from '../decorators/exception/ExceptionDecorator';
import {ConstructorType} from '../types/Types';

export class SimProxyHandler implements ProxyHandler<any> {
    constructor(private simstanceManager: SimstanceManager, private simOption: SimOption) {
    }

    public get(target: any, name: string): any {
        if (name === '_SimpleBoot_simstanceManager') {
            return this.simstanceManager;
        } else if (name === '_SimpleBoot_simOption') {
            return this.simOption;
        } else {
            return target[name]
        }
    }

    public set(obj: any, prop: string, value: any, receiver: any): boolean {
        // console.log('proxy set-->')
        value = this.simstanceManager?.proxy(value)
        // this.aopBefore(AOPAction.set, obj, prop, value);
        obj[prop] = value
        return true
    }

    apply(target: Function, thisArg: any, argumentsList?: any): any {
        let r;
        try {
            this.aopBefore(thisArg, target);
            r = target.apply(thisArg, argumentsList);
            this.aopAfter(thisArg, target);
        } catch (e: Error | any) {
            const otherStorage = new Map<ConstructorType<any>, any>();
            otherStorage.set(e.constructor, e);
            (argumentsList as Array<any>)?.forEach(it => {
                otherStorage.set(e.constructor, e);
            });

            const inHandler = targetExceptionHandler(thisArg, e)
            if (inHandler) {
                let data = this.simstanceManager.executeBindParameterSim({
                    target: thisArg,
                    targetKey: inHandler.propertyKey
                }, otherStorage);
            } else {
                for (let i = 0; i < this.simOption.advice.length; i++) {
                    const sim = this.simstanceManager?.getOrNewSim(this.simOption.advice[i]);
                    const inHandler = targetExceptionHandler(sim, e)
                    if (inHandler) {
                        let data = this.simstanceManager.executeBindParameterSim({
                            target: sim,
                            targetKey: inHandler.propertyKey
                        }, otherStorage);
                        break;
                    }
                }
            }
            console.error(e)
        }
        return r
    }

    private aopBefore(obj: any, protoType: Function) {
        const propertyName = ObjectUtils.getPrototypeName(obj, protoType);
        if (propertyName) {
            getProtoBefores(obj, propertyName).forEach(it => {
                it.call(obj, protoType, propertyName)
            })

            for (let i = 0; i < this.simOption.advice.length; i++) {
                const sim = this.simstanceManager?.getOrNewSim(this.simOption.advice[i]);
                const protoBefores = getProtoBefores(sim, propertyName, Object.getPrototypeOf(obj));
                protoBefores.forEach(it => {
                    it.call(obj, protoType, propertyName)
                })
            }
        }
    }

    private aopAfter(obj: any, protoType: Function) {
        const propertyName = ObjectUtils.getPrototypeName(obj, protoType);
        if (propertyName) {
            getProtoAfters(obj, propertyName).forEach(it => {
                it.call(obj, protoType, propertyName)
            })

            for (let i = 0; i < this.simOption.advice.length; i++) {
                const sim = this.simstanceManager?.getOrNewSim(this.simOption.advice[i]);
                const protoBefores = getProtoAfters(sim, propertyName, Object.getPrototypeOf(obj));
                protoBefores.forEach(it => {
                    it.call(obj, protoType, propertyName)
                })
            }
        }
    }

    has(target: any, key: PropertyKey): boolean {
        if (key === 'isProxy') {
            return true
        }
        return key in target
    }
}
