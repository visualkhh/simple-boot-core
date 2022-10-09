import 'reflect-metadata'
import {ConstructorType} from '../types/Types'
import {SimNoSuch} from '../throwable/SimNoSuch'
import {getPostConstruct, getSim, sims} from '../decorators/SimDecorator';
import {Runnable} from '../run/Runnable';
import {ObjectUtils} from '../utils/object/ObjectUtils';
import {SimAtomic} from './SimAtomic';
import {ReflectUtils} from '../utils/reflect/ReflectUtils';
import {FunctionUtils} from '../utils/function/FunctionUtils';
import {getInject, SaveInjectConfig, SituationTypeContainer, SituationTypeContainers} from '../decorators/inject/Inject';
import {SimOption} from '../SimOption';
import {SimProxyHandler} from '../proxy/SimProxyHandler';

export type FirstCheckMaker = (obj: { target: Object, targetKey?: string | symbol }, token: ConstructorType<any>, idx: number, saveInjectConfig?: SaveInjectConfig) => any | undefined;

export class SimstanceManager implements Runnable {
    private _storage = new Map<ConstructorType<any>, Map<ConstructorType<any>, undefined | any>>()
    private simProxyHandler: SimProxyHandler;
    private otherInstanceSim?: Map<ConstructorType<any>, any>;

    constructor(private option: SimOption) {
        this.set(SimstanceManager, this);
        this.set((option as any).constructor, option);
        this.set(SimOption, option);
        this.simProxyHandler = new SimProxyHandler(this, option);
    }

    get storage() {
        return this._storage
    }

    getSimAtomics(): SimAtomic[] {
        return Array.from(this._storage.keys()).map(it => new SimAtomic(it, this));
    }

    getSimConfig(scheme: string | undefined): SimAtomic<any>[] {
        const newVar = this.getSimAtomics().filter(it => scheme && it && scheme === it?.getConfig()?.scheme) || [];
        return newVar;
    }

    findFirstSim({scheme, type}: { scheme?: string, type?: ConstructorType<any> }): SimAtomic<any> | undefined {
        if (scheme || type) {
            const simAtomics = this.getSimAtomics();
            const find = simAtomics.find(it => {
                // const b = (scheme ? scheme === it.getConfig()?.scheme : true) && (type ? it.value instanceof type : true);
                const b = (scheme ? scheme === it.getConfig()?.scheme : true) && (type ? it.type === type : true);
                return b
            });
            return find
        }
    }

    getStoreSets<T>(targetKey: ConstructorType<T>): {type: ConstructorType<T>, instance?: T} [] {
        const map = this.storage.get(targetKey);
        const datas = (Array.from(map?.entries?.() ?? []) ?? []).reverse();
        return datas.map(it => ({type: it[0], instance: it[1]}));
    }

    getStoreSet<T>(targetKey: ConstructorType<T>, target?: ConstructorType<any>): {type: ConstructorType<T>, instance?: T} | undefined {
        return this.getStoreSets(targetKey).find(it => it.type === target) ?? this.getStoreSets(targetKey)[0];
    }

    getStoreInstance<T>(targetKey: ConstructorType<T>, target?: ConstructorType<any>) {
        return this.getStoreSet(targetKey, target)?.instance;
    }

    getOrNewSim<T>(target?: ConstructorType<T>): T | undefined {
        if (target) {
            const registed = this.getStoreSet(target);
            if (registed?.type && !registed?.instance) {
                return this.resolve(target)
            }
            return registed?.instance
        }
    }

    // getOrNewSims<T>(k: ConstructorType<T>): T[] {
    //     const list = new Array<T>(0);
    //     this.storage.forEach((value, key, mapObject) => {
    //         let sw = false;
    //         if (value && value instanceof k) {
    //             sw = true;
    //             // eslint-disable-next-line no-prototype-builtins
    //         } else if (key === k || k.isPrototypeOf(key)) {
    //             sw = true;
    //         }
    //         if (sw) {
    //             if (!value) {
    //                 value = this.resolve(key);
    //             }
    //             list.push(value);
    //         }
    //     })
    //     return list;
    // }

    register(keyType: ConstructorType<any>, regTyps: Set<ConstructorType<any>>): void {
        const itemMap = this._storage.get(keyType) ?? new Map<ConstructorType<any>, any>();
        regTyps.forEach(it => {
            if (!itemMap.has(it)) {
                itemMap.set(it, undefined);
            }
        })
        this._storage.set(keyType, itemMap);
    }

    set(targetKey: ConstructorType<any>, obj: any, target: ConstructorType<any> = targetKey): void {
        const itemMap = this._storage.get(targetKey) ?? new Map<ConstructorType<any>, any>();
        itemMap.set(target, obj);
        this._storage.set(targetKey, itemMap)
    }

    resolve<T>(targetKey: ConstructorType<any>, target?: ConstructorType<any>): T {
        const registed = this.getStoreSet(targetKey, target);
        if (registed?.instance) {
            return registed.instance;
        }

        if (this._storage.has(targetKey) && undefined === registed?.instance) {
            const newSim = this.newSim(registed?.type ?? targetKey, (data) => this.set(targetKey, data, target));
            newSim?.onSimCreate?.();
            return newSim
        }
        const simNoSuch = new SimNoSuch('SimNoSuch: no simple instance ' + 'name:' + targetKey?.prototype?.constructor?.name + ',' + targetKey);
        console.error(simNoSuch);
        throw simNoSuch
    }

    public newSim<T>(target: ConstructorType<T>, simCreateAfter?: (data: T) => void, otherStorage?: Map<ConstructorType<any>, any>): T {
        const r = new target(...this.getParameterSim({target}, otherStorage))
        const p = this.proxy(r);
        // 순환참조 막기위한 콜백 처리
        simCreateAfter?.(p);
        this.callBindPostConstruct(p);
        return p;
    }

    public callBindPostConstruct(obj: any) {
        const set = new Set(ObjectUtils.getAllProtoTypeName(obj));
        set.forEach(it => {
            const postConstruct = getPostConstruct(obj, it);
            if (postConstruct) {
                (obj as any)[it](...this.getParameterSim({target: obj, targetKey: it}))
            }
        })
    }

    public async executeBindParameterSimPromise({target, targetKey, firstCheckMaker}: { target: Object, targetKey?: string | symbol, firstCheckMaker?: FirstCheckMaker[] },
        otherStorage?: Map<ConstructorType<any>, any>) {
        let value = this.executeBindParameterSim({target, targetKey, firstCheckMaker}, otherStorage);
        if (value instanceof Promise) {
            value = await value;
        }
        return value;
    }

    public executeBindParameterSim({target, targetKey, firstCheckMaker}: { target: Object, targetKey?: string | symbol, firstCheckMaker?: FirstCheckMaker[] },
        otherStorage?: Map<ConstructorType<any>, any>) {
        const binds = this.getParameterSim({target, targetKey, firstCheckMaker}, otherStorage);
        if (typeof target === 'object' && targetKey) {
            const targetMethod = (target as any)[targetKey];
            return targetMethod?.bind(target)?.(...binds);
        } else if (typeof target === 'function' && !targetKey) {
            return new (target as ConstructorType<any>)(...binds);
        }
    }

    public getParameterSim({target, targetKey, firstCheckMaker}: { target: Object, targetKey?: string | symbol, firstCheckMaker?: FirstCheckMaker[] }, otherStorage?: Map<ConstructorType<any>, any>): any[] {
        const paramTypes = ReflectUtils.getParameterTypes(target, targetKey);
        const paramNames = FunctionUtils.getParameterNames(target, targetKey);
        // const a = ReflectUtils.getType(target, 'user');
        let injections = [];
        const injects = getInject(target, targetKey);
        injections = paramTypes.map((token: ConstructorType<any>, idx: number) => {
            const saveInject = injects?.find(it => it.index === idx);
            if (saveInject?.config.disabled) {
                return undefined;
            }
            for (const f of firstCheckMaker ?? []) {
                const firstCheckObj = f({target, targetKey}, token, idx, saveInject);
                if (undefined !== firstCheckObj) {
                    return firstCheckObj;
                }
            }
            if (saveInject) {
                const inject = saveInject.config;
                let obj = otherStorage?.get(token);
                if (token === Array && inject.type) {
                    const p = this.getStoreSets(inject.type).map(it => this.resolve(inject.type!, it.type));
                    return p;
                }

                // situational
                if (inject.situationType && otherStorage) {
                    const situations = otherStorage.get(SituationTypeContainers) as SituationTypeContainers;
                    const situation = otherStorage.get(SituationTypeContainer) as SituationTypeContainer;
                    if (inject.situationType === situation?.situationType) {
                        obj = situation.data;
                    } else if (situations && situations.length > 0) {
                        const find = situations.find(a => a.situationType === inject.situationType)
                        if (find) {
                            obj = find.data;
                        }
                    }
                }

                if (!obj) {
                    const findFirstSim = this.findFirstSim({scheme: inject.scheme, type: inject.type});
                    obj = findFirstSim ? this.resolve<any>(findFirstSim?.type ?? token) : this.resolve<any>(token);
                }
                if (inject.applyProxy) {
                    if (inject.applyProxy.param) {
                        obj = new Proxy(obj, new inject.applyProxy.type(...inject.applyProxy.param));
                    } else {
                        obj = new Proxy(obj, new inject.applyProxy.type());
                    }
                }
                return obj;
            } else if (token) {
                return otherStorage?.get(token) ?? this.resolve<any>(token);
            }
        });
        return injections;
    }

    public proxy<T = any>(target: T): T {
        if (target !== null && getSim(target) && (typeof target === 'object') && (!('isProxy' in target))) {
            for (const key in target) {
                // console.log('target->', target, key)
                target[key] = this.proxy(target[key]);
            }

            // function apply proxy
            const protoTypeName = ObjectUtils.getOwnPropertyNames(target);
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

    run(otherInstanceSim?: Map<ConstructorType<any>, any>) {
        this.otherInstanceSim = otherInstanceSim;
        this.otherInstanceSim?.forEach((value, key) => {
            this.set(key, value);
        })
        sims.forEach((regTypes, k) => {
            this.register(k, regTypes);
        })
        this.callBindPostConstruct(this);
    }
}
