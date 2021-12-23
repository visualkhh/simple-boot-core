import "reflect-metadata"
import {ConstructorType} from '../types/Types'
import {SimNoSuch} from '../throwable/SimNoSuch'
import { getPostConstruct, getSim, PostConstruct, sims } from '../decorators/SimDecorator';
import {Runnable} from '../run/Runnable';
import {ObjectUtils} from '../utils/object/ObjectUtils';
import {SimAtomic} from './SimAtomic';
import {ReflectUtils} from '../utils/reflect/ReflectUtils';
import {FunctionUtils} from '../utils/function/FunctionUtils';
import {getInject} from '../decorators/inject/Inject';
import {SimOption} from '../SimOption';
import {SimProxyHandler} from '../proxy/SimProxyHandler';

export class SimstanceManager implements Runnable {
    private _storage = new Map<ConstructorType<any>, any>()
    private simProxyHandler: SimProxyHandler;

    constructor(private option: SimOption) {
        this._storage.set(SimstanceManager, this);
        this._storage.set((option as any).constructor, option);
        this._storage.set(SimOption, option);
        this.simProxyHandler = new SimProxyHandler(this, option);
    }

    get storage(): Map<ConstructorType<any>, any> {
        return this._storage
    }

    // getSimAtomicDataCheck<DT>(type: ConstructorType<any>, dataType: ConstructorType<DT>): SimAtomic<DT> {
    //     const simConfig = getSim(type);
    //     if (simConfig?.data instanceof dataType) {
    //         return new SimAtomic<DT>(type, this)
    //     }
    //     throw new SimNoSuch('no simple getSimAtomicDataCheck ' + simConfig)
    // }
    //
    // getSimAtomic(type: ConstructorType<any>): SimAtomic {
    //     return new SimAtomic(type, this)
    // }

    // getSimAtomic<C extends SimConfig, T extends Object = Object>(type: ConstructorType<T>, key = SimMetadataKey): SimAtomic<C, T> {
    //     return new SimAtomic<C, T>(type, key);
    // }

    getSimAtomics(): SimAtomic[] {
        return Array.from(this._storage.keys()).map(it => new SimAtomic(it, this));
    }

    getSimConfig(scheme: string | undefined): SimAtomic<any>[] {
        const newVar = this.getSimAtomics().filter(it => scheme && it && scheme === it?.getConfig()?.scheme) || [];
        return newVar;
    }

    findFirstSim(scheme?: string, type?: ConstructorType<any>): SimAtomic<any> | undefined {
        if (scheme || type) {
            return this.getSimAtomics().filter(it => {
                const b = (scheme ? scheme === it.getConfig()?.scheme : true) && (type ? it.value instanceof type : true);
                return b
            })[0]
        }
    }

    // getOrNewSimSet<T>(k: ConstructorType<T>): T {
    //
    // }
    // getOrNewSimDataCheck<T>(k: ConstructorType<T>): T {
    //     const orNewSim = this.getOrNewSim(k);
    //     if (orNewSim) {
    //     } else {
    //         throw new SimNoSuch('no simple instance (getOrNewSimDataCheck) ' + orNewSim)
    //     }
    //     return orNewSim;
    // }
    // this.resolve(k) exception 내야하나..? throws... 안쪽에서 undifined해야되는거 아닌가?
    // 아니다 익명 Module이 있을수 있으니 매번 오류메시지 낼필요없다.
    getOrNewSim<T>(k?: ConstructorType<T>): T | undefined {
        if (k) {
            let newVar = this.storage.get(k)
            if (!newVar) {
                newVar = this.resolve(k)
            }
            return newVar
        }
    }

    getOrNewSims<T>(k: ConstructorType<T>): T[] {
        const list = new Array<T>(0);
        this.storage.forEach((value, key, mapObject) => {
            let sw = false;
            if (value && value instanceof k) {
                sw = true;
                // eslint-disable-next-line no-prototype-builtins
            } else if (key === k || k.isPrototypeOf(key)) {
                sw = true;
            }
            if (sw) {
                if (!value) {
                    value = this.resolve(key);
                }
                list.push(value);
            }
        })
        return list;
    }

    register(target: ConstructorType<any>): void {
        if (!this._storage.has(target)) {
            this._storage.set(target, undefined)
        }
    }

    set(target: ConstructorType<any>, obj: any): void {
        this._storage.set(target, obj)
    }

    resolve<T>(target: ConstructorType<any>): T {
        const registed = this._storage.get(target)
        if (registed) {
            return registed as T
        }

        if (this._storage.has(target) && undefined === registed) {
            const newSim = this.newSim(target, (data) => this._storage.set(target, data));
            newSim?.onSimCreate?.();
            return newSim
        }
        const simNoSuch = new SimNoSuch('SimNoSuch: no simple instance ' + 'name:' + target?.prototype?.constructor?.name + ',' + target );
        console.error(simNoSuch);
        throw simNoSuch
    }

    public newSim<T>(target: ConstructorType<T>, simCreateAfter?: (data: T) => void): T {
        // console.log('======newSim-->', target, simCreateAfter)
        const r = new target(...this.getParameterSim({target}))
        // this.settingEventListener(r);
        const p = this.proxy(r);
        // 순환참조 막기위한 콜백 처리
        simCreateAfter?.(p);
        this.callBindPostConstruct(p);
        // object in module proxy
        // if (p instanceof Module) {
        //     this.moduleObjectPropProxy(p);
        // }
        return p;
    }

    public callBindPostConstruct(obj: any) {
        const set = new Set(ObjectUtils.getAllProtoTypeName(obj));
        set.forEach(it => {
            const postConstruct = getPostConstruct(obj, it);
            // console.log('------>', it, postConstruct)
            if (postConstruct) {
                (obj as any)[it](...this.getParameterSim({target: obj, targetKey: it}))
            }
        })
    }

    public getParameterSim({target, targetKey}: {target: Object, targetKey?: string | symbol}, otherStorage?: Map<ConstructorType<any>, any>): any[] {
        const paramTypes = ReflectUtils.getParameterTypes(target, targetKey);
        const paramNames = FunctionUtils.getParameterNames(target, targetKey);
        const injections = paramTypes.map((token: ConstructorType<any>, idx: number) => {
            const metHodTarget = targetKey ? (target as any)[targetKey] : target;
            const inject = getInject(metHodTarget, String(idx));
            if (inject) {
                let obj = otherStorage?.get(token);
                if (!obj) {
                    const findFirstSim1 = this.findFirstSim(inject.scheme, inject.type);
                    obj = findFirstSim1 ? this.resolve<any>(findFirstSim1?.type ?? token) : undefined;
                }
                if (inject.applyProxy) {
                    obj = new Proxy(obj, new inject.applyProxy.type(inject.applyProxy.param));
                }
                return obj;
            } else if (token) {
                return otherStorage?.get(token) ?? this.resolve<any>(token);
            }
        })
        return injections;
    }

    public proxy<T = any>(target: T): T {
        if (getSim(target) && (typeof target === 'object') && (!('isProxy' in target))) {
            for (const key in target) {
                // console.log('target->', target, key)
                target[key] = this.proxy(target[key]);
            }

            // function apply proxy
            const protoTypeName = ObjectUtils.getProtoTypeName(target);
            protoTypeName.filter(it => typeof (target as any)[it] === 'function').forEach(it => {
                (target as any)[it] = new Proxy((target as any)[it], this.simProxyHandler!);
            });

            if (this.simProxyHandler) {
                target = new Proxy(target, this.simProxyHandler);
            }
        }

        if (this.option.proxy) {
            target = this.option.proxy.onProxy(target);
        }
        return target;
    }

    // public moduleObjectPropProxy(target: Module): Module {
    //     // console.log('isProxy-->', ('isProxy' in target));
    //     // if (target instanceof Object && !('isProxy' in target)) {
    //     for (const key in target) {
    //         const prop = (target as any)[key];
    //         if (prop instanceof Module) {
    //             this.moduleObjectPropProxy(prop)
    //         } else if (prop && typeof prop === 'object' && !(prop instanceof Map)) {
    //             // map Object는 proxy 안걸린다 왜그러는건가?
    //             if (!('isProxy' in prop)) {
    //                 (target as any)[key] = new Proxy(prop, new SimObjectProxyHandler());
    //             }
    //             const _refModule = ((target as any)[key]).simObjectProxyHandler_refModule;
    //             if (_refModule) {
    //                 _refModule.set(key, target)
    //             }
    //         }
    //     }
    //     return target;
    // }

    run() {
        sims.forEach((data: any) => {
            this.register(data);
        })
        this.callBindPostConstruct(this);
        // console.log('---', this._storage)
    }
}
