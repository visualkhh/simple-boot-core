import {SimstanceManager} from '../simstance/SimstanceManager'
import {ConstructorType} from '../types/Types'
import {SimGlobal} from '../global/SimGlobal';
import {Sim} from '../decorators/SimDecorator';
import {getTargetAndIncludeNullAndSortExceptionHandlers} from '../decorators/exception/ExceptionDecorator';
import {getProtoAfters, getProtoBefores} from '../decorators/aop/AOPDecorator';
import {ObjectUtils} from '../utils/object/ObjectUtils';
import {SimOption} from '../SimOption';

@Sim()
export class SimProxyHandler implements ProxyHandler<any> {
    private simstanceManager?: SimstanceManager;

    constructor(private simOption: SimOption) {
        this.simstanceManager = SimGlobal().application?.simstanceManager;
    }

    public get(target: any, name: string): any {
        return target[name]
    }

    public set(obj: any, prop: string, value: any, receiver: any): boolean {
        // console.log('proxy set-->')
        value = this.simstanceManager?.proxy(value, Object)
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
            const inHandler = getTargetAndIncludeNullAndSortExceptionHandlers(thisArg, e)
            if (inHandler.length > 0) {
                inHandler[inHandler.length - 1].call(e, thisArg, target, argumentsList);
            } else {
                for (let i = 0; i < this.simOption.advice.length; i++) {
                    const sim = this.simstanceManager?.getOrNewSim(this.simOption.advice[i]);
                    const inHandler = getTargetAndIncludeNullAndSortExceptionHandlers(sim, e)
                    if (inHandler.length > 0) {
                        inHandler[inHandler.length - 1].call(e, thisArg, target, argumentsList);
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
