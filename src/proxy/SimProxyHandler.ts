import {SimstanceManager} from '../simstance/SimstanceManager'
import {getProtoAfters, getProtoBefores} from '../decorators/aop/AOPDecorator';
import {ObjectUtils} from '../utils/object/ObjectUtils';
import {SimOption} from '../SimOption';
import {ExceptionHandlerSituationType, SaveExceptionHandlerConfig, targetExceptionHandler} from '../decorators/exception/ExceptionDecorator';
import {ConstructorType} from '../types/Types';
import {SituationTypeContainer, SituationTypeContainers} from '../decorators/inject/Inject';

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
        value = this.simstanceManager?.proxy(value)
        obj[prop] = value
        return true
    }

    apply(target: Function, thisArg: any, argumentsList?: any[]): any {
        let r;
        try {
            this.aopBefore(thisArg, target);
            try {
                r = target.apply(thisArg, argumentsList);
                // eslint-disable-next-line no-useless-catch
            } catch (e) {
                throw e;
            } finally {
                this.aopAfter(thisArg, target);
            }
        } catch (e: Error | any) {
            console.error(e);
            const inHandlers = this.getExceptionHandler(e, thisArg, target);
            if (inHandlers.length > 0 && inHandlers[0]) {
                const inHandler = inHandlers[0];
                this.executeExceptionHandler(e, inHandler, argumentsList);
            } else {
                throw e;
            }
        }
        return r
    }

    private executeExceptionHandler(e: any, inHandler: { thisArg: any; config: SaveExceptionHandlerConfig }, argumentsList?: any[]) {
        const otherStorage = new Map<ConstructorType<any>, any>();
        otherStorage.set(e.constructor, e);
        const situationErrorTypeContainer = new SituationTypeContainer({
            situationType: ExceptionHandlerSituationType.ERROR_OBJECT,
            data: e
        });
        const situationParameterTypeContainer = new SituationTypeContainer({
            situationType: ExceptionHandlerSituationType.PARAMETER,
            data: argumentsList
        });
        otherStorage.set(SituationTypeContainers, new SituationTypeContainers([situationErrorTypeContainer, situationParameterTypeContainer]));
        argumentsList?.forEach(it => {
            otherStorage.set(it.constructor, it);
        });
        try {
            this.simstanceManager.executeBindParameterSim({
                target: inHandler.thisArg,
                targetKey: inHandler.config.propertyKey
            }, otherStorage);
        } catch (es) {
            e = es;
        }
        if (inHandler.config.config.throw) {
            const exceptionHandler = this.getExceptionHandler(e, inHandler.thisArg, inHandler.config.method);
            if ((exceptionHandler?.length ?? 0) > 0) {
                this.executeExceptionHandler(e, exceptionHandler[0], argumentsList);
            }
        }
    }

    private getExceptionHandler(e: any, thisArg: any, target: Function) {
        const globalConfigSets = this.simOption.advice.map(it => this.simstanceManager?.getOrNewSim(it)).filter(it => it).map(it => {
            return {thisArg: it, config: targetExceptionHandler(it, e, [target])}
        }) ?? [];
        const thisConfigSet = {thisArg: thisArg, config: targetExceptionHandler(thisArg, e, [target])}
        const inHandlers = [thisConfigSet, ...globalConfigSets].filter(it => it && it.config) as { thisArg: any, config: SaveExceptionHandlerConfig }[];
        return inHandlers;
    }

    private aopBefore(obj: any, protoType: Function) {
        const propertyName = ObjectUtils.getPrototypeName(obj, protoType);
        if (propertyName && obj) {
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
