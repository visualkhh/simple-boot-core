import 'reflect-metadata'
import { ConstructorType } from '../types/Types'
import { SimNoSuch } from '../throwable/SimNoSuch'
import { getPostConstruct, getSim, Lifecycle, Sim, sims } from '../decorators/SimDecorator';
import { Runnable } from '../run/Runnable';
import { ObjectUtils } from '../utils/object/ObjectUtils';
import { SimAtomic } from './SimAtomic';
import { ReflectUtils } from '../utils/reflect/ReflectUtils';
import { getInject, SaveInjectConfig, SituationTypeContainer, SituationTypeContainers } from '../decorators/inject/Inject';
import { SimOption } from '../SimOption';
import { SimProxyHandler } from '../proxy/SimProxyHandler';

export type FirstCheckMaker = (obj: { target: Object, targetKey?: string | symbol }, token: ConstructorType<any>, idx: number, saveInjectConfig?: SaveInjectConfig) => any | undefined;

export class SimstanceManager implements Runnable {
  private _storage = new Map<ConstructorType<any> | Function, Map<ConstructorType<any> | Function, undefined | any>>()
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
    const r: SimAtomic[] = [];
    Array.from(this._storage.values()).forEach(it => {
      r.push(...Array.from(Array.from(it.keys())).map(sit => new SimAtomic(sit, this)));
    });
    return r;
  }

  getSimConfig(schemeOrSymbol: string | Symbol | undefined): SimAtomic<any>[] {
    const newVar = this.getSimAtomics().filter(it => {
      if (typeof schemeOrSymbol === 'symbol') {
        console.log('-------->', it?.getConfig(), schemeOrSymbol)
        return schemeOrSymbol && it && schemeOrSymbol === it?.getConfig()?.symbol
      } else {
        return schemeOrSymbol && it && schemeOrSymbol === it?.getConfig()?.scheme
      }
    }) || [];
    return newVar;
  }


  findFirstSim<T = any>(symbol: Symbol): SimAtomic<T> | undefined ;
  findFirstSim<T = any>(data: { scheme?: string, type?: ConstructorType<any> }): SimAtomic<T> | undefined ;
  findFirstSim<T = any>(data: { scheme?: string, type?: ConstructorType<any> } | Symbol): SimAtomic<T> | undefined {
    if (data) {
      const simAtomics = this.getSimAtomics();
      const find = simAtomics.find(it => {
        let b = false;
        if (typeof data === 'symbol') {
          b = (data === it.getConfig()?.symbol);
        } else {
          const {scheme, type} = data as { scheme?: string, type?: ConstructorType<any> };
          b = (scheme ? scheme === it.getConfig()?.scheme : true) && (type ? it.type === type : true);
        }
        return b
      });
      return find as SimAtomic<T>;
    }
  }

  getStoreSets<T>(targetKey: ConstructorType<T> | Function): { type: ConstructorType<T> | Function, instance?: T } [] {
    // const depths = ObjectUtils.getAllProtoType(targetKey);
    // const keys = Array.from(this.storage.keys()).filter(it => depths.includes(it)); //.map(it => ({isMatch: depths.includes(it)}));
    // keys.sort((a, b) => { return depths.indexOf(a) - depths.indexOf(b) });

    // console.log('------', keys);
    // this.storage.forEach((value, key) => {
    // })
    // const map = this.storage.get(keys[0] ?? targetKey);
    const map = this.storage.get(targetKey);
    // console.log('-------', map)
    const datas = (Array.from(map?.entries?.() ?? []) ?? []).reverse();
    return datas.map(it => ({type: it[0], instance: it[1]}));
  }

  getStoreSet<T>(targetKey: ConstructorType<T> | Function, target?: ConstructorType<any> | Function): { type: ConstructorType<T> | Function, instance?: T } | undefined {
    // const chain = this.getStoreSets(targetKey).find(it => Object.prototype.isPrototypeOf.call(start.prototype, target));
    // console.log('?????', targetKey, this.getStoreSets(targetKey))
    // this.getStoreSets(targetKey).forEach(it => {
    //   console.log('for----->', it);
    //   const depth = (target:  ConstructorType<T> | Function,  bowl: any[] = []) => {
    //     if (target.prototype) {
    //       bowl.push(target);
    //       depth(Object.getPrototypeOf(target), bowl);
    //     }
    //     return bowl;
    //   }
    //   const data = depth(it.type);
    //   console.log('------>data', data);
    // })
    return this.getStoreSets(targetKey).find(it => it.type === target) ?? this.getStoreSets(targetKey)[0];
  }

  getStoreInstance<T>(targetKey: ConstructorType<T>, target?: ConstructorType<any>) {
    return this.getStoreSet(targetKey, target)?.instance;
  }

  getOrNewSim<T>(target?: ConstructorType<T> | Function): T | undefined {
    if (target) {
      const registed = this.getStoreSet(target);
      if (registed?.type && !registed?.instance) {
        return this.resolve(target)
      }
      return registed?.instance
    }
  }

  register(keyType: ConstructorType<any> | Function, regTyps: Set<ConstructorType<any> | Function>): void {
    const itemMap = this._storage.get(keyType) ?? new Map<ConstructorType<any> | Function, any>();
    regTyps.forEach(it => {
      if (!itemMap.has(it)) {
        itemMap.set(it, undefined);
      }
    })
    this._storage.set(keyType, itemMap);
  }

  set(targetKey: ConstructorType<any> | Function, obj: any, target: ConstructorType<any> | Function = targetKey): void {
    const itemMap = this._storage.get(targetKey) ?? new Map<ConstructorType<any>, any>();
    itemMap.set(target, obj);
    this._storage.set(targetKey, itemMap)
  }

  resolve<T>(targetKey: ConstructorType<any> | Function, target?: ConstructorType<any> | Function): T {
    const registed = this.getStoreSet(targetKey, target);
    if (registed?.instance) {
      return registed.instance;
    }

    if (this._storage.has(targetKey) && undefined === registed?.instance) {
      const newSim = this.newSim(registed?.type ?? targetKey, (data) => {
        // scope check! and action
        // this.getSimConfig()
        if (getSim(registed?.type ?? target ?? targetKey)?.scope === Lifecycle.Singleton) {
          this.set(targetKey, data, target)
        }
      });
      newSim?.onSimCreate?.();
      return newSim
    }
    const simNoSuch = new SimNoSuch('SimNoSuch: no simple instance ' + 'name:' + targetKey?.prototype?.constructor?.name + ',' + targetKey);
    console.error(simNoSuch);
    throw simNoSuch
  }

  public newSim<T = any>(target: ConstructorType<T> | Function, simCreateAfter?: (data: T) => void, otherStorage?: Map<ConstructorType<any>, any>): T {
    // @ts-ignore
    const r = new target(...this.getParameterSim({target}, otherStorage))
    let p = this.proxy(r);
    const config = getSim(target);
    if (config?.proxy) {
      const proxys = Array.isArray(config.proxy) ? config.proxy : [config.proxy];
      proxys.forEach(it => {
        if (typeof it === 'object') {
          p = new Proxy(p, it);
        } else {
          p = new Proxy(p, this.getOrNewSim(it));
        }
      })
    }
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
    // const paramNames = FunctionUtils.getParameterNames(target, targetKey);
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
        if (token === Array && (inject.type || inject.scheme || inject.symbol)) {
          const p = [];
          if (inject.type) {
            p.push(...this.getStoreSets(inject.type).map(it => this.resolve(inject.type!, it.type)).reverse());
          }
          if (inject.symbol) {
            p.push(...this.getSimConfig(inject.symbol).map(it => it.value));
          }
          if (inject.scheme) {
            p.push(...this.getSimConfig(inject.scheme).map(it => it.value));
          }
          return p;
        }
        // situational
        if (inject.situationType && otherStorage) {
          const situations = otherStorage.get(SituationTypeContainers) as SituationTypeContainers;
          const situation = otherStorage.get(SituationTypeContainer) as SituationTypeContainer;
          if (inject.situationType === situation?.situationType) {
            obj = situation.data;
          } else if (situations && situations.length > 0) {
            const find = situations.find(a => {
              if (a.index !== undefined) {
                return a.situationType === inject.situationType && a.index === idx
              } else {
                return a.situationType === inject.situationType
              }
            })
            if (find) {
              obj = find.data;
            }
          }
        }

        if (!obj) {
          const findFirstSim = inject.symbol ? this.findFirstSim(inject.symbol) : this.findFirstSim({scheme: inject.scheme, type: inject.type});
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
      return undefined;
    });
    return injections;
  }

  public proxy<T = any>(target: T): T {
    if (target !== null && getSim(target) && (typeof target === 'object') && (!('isProxy' in target))) {
      for (const key in target) {
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
