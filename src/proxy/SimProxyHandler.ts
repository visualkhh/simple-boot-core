import {Module} from '../module/Module'
import {SimstanceManager} from '../simstance/SimstanceManager'
import {ConstructorType} from '../types/Types'
import {SimGlobal} from '../global/SimGlobal';
import {Sim} from '../decorators/SimDecorator';
import {getTargetAndIncludeNullAndSortExceptionHandlers} from '../decorators/exception/ExceptionDecorator';
import {getProtoAfters, getProtoBefores} from '../decorators/aop/AOPDecorator';
import {ObjectUtils} from '../utils/object/ObjectUtils';
import {SimProxy} from './SimProxy';
import {SimOption} from "../SimOption";

@Sim()
export class SimProxyHandler extends SimProxy {
    private simstanceManager?: SimstanceManager;

    constructor(private simOption: SimOption) {
        super()
        this.simstanceManager = SimGlobal().application?.simstanceManager;
    }

    public get(target: any, name: string): any {
        // this.aopBefore(AOPAction.get, target, name, target[name]);
        // setTimeout(() => this.aopAfter(AOPAction.get, target, name, target[name]), 1)
        return target[name]
    }

    public set(obj: any, prop: string, value: any, receiver: any): boolean {
        // console.log('proxy set-->')
        value = this.simstanceManager?.proxy(value, Module)
        // this.aopBefore(AOPAction.set, obj, prop, value);
        obj[prop] = value

        if (this.simOption.simProxy) {
            return this.simOption.simProxy.set(obj, prop, value, receiver);
        } else {
            return true
        }
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
}
