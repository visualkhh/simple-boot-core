import 'reflect-metadata'
import { ConstructorType, GenericClassDecorator } from '../types/Types'
import { ReflectUtils } from '../utils/reflect/ReflectUtils';
import { SimpleApplication } from 'SimpleApplication';

export enum Lifecycle {
  /**
   * The default registration scope, Each resolve will return the same instance (including resolves from child containers)
   */
  Singleton = 'Singleton',
  /**
   * a new instance will be created with each resolve
   */
  Transient = 'Transient'
}

export const sims = new Map<ConstructorType<any> | Function, Set<ConstructorType<any> | Function>>();
export const containers = new Set<SimpleApplication>();

export interface SimConfig {
  symbol?: Symbol | (Symbol[]);
  scheme?: string | (string[]);
  scope?: Lifecycle;
  container?: string | (string[]);
  autoCreate?: boolean;
  proxy?: ((ProxyHandler<any> | ConstructorType<any> | Function)) | (ProxyHandler<any> | ConstructorType<any> | Function)[];
  type?: (ConstructorType<any> | Function) | (ConstructorType<any> | Function)[];
  using?: (ConstructorType<any> | Function) | (ConstructorType<any> | Function)[];
}

export const SimMetadataKey = Symbol('Sim');
const simProcess = (config: SimConfig, target: ConstructorType<any> | Function) => {
  // default setting
  config.scope = config?.scope ?? Lifecycle.Singleton;

  ReflectUtils.defineMetadata(SimMetadataKey, config, target);
  const adding = (targetKey: ConstructorType<any> | Function, target: ConstructorType<any> | Function = targetKey) => {
    const items = sims.get(targetKey) ?? new Set<ConstructorType<any> | Function>();
    items.add(target);
    sims.set(targetKey, items);
  }


  if (Array.isArray(config?.type)) {
    config?.type.forEach(it => {
      adding(it, target);
    })
  } else if (config.type) {
    adding(config?.type, target);
  }
  // else {
  //   adding(target)
  // }
  adding(target)
}

export function Sim(target: ConstructorType<any> | Function): void;
export function Sim(config: SimConfig): GenericClassDecorator<ConstructorType<any> | Function>;
export function Sim(configOrTarget: SimConfig | ConstructorType<any> | Function): void | GenericClassDecorator<ConstructorType<any> | Function> {
  if (typeof configOrTarget === 'function') {
    simProcess({}, configOrTarget);
  } else {
    return (target: ConstructorType<any> | Function) => {
      simProcess(configOrTarget, target);
    }
  }
}

export const getSim = (target: ConstructorType<any> | Function | any): SimConfig | undefined => {
  if (target != null && target !== undefined && typeof target === 'object') {
    target = target.constructor;
  }
  try {
    return ReflectUtils.getMetadata(SimMetadataKey, target);
  } catch (e) {
  }
}

const PostConstructMetadataKey = Symbol('PostConstruct');
export const PostConstruct = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
  ReflectUtils.defineMetadata(PostConstructMetadataKey, PostConstructMetadataKey, target, propertyKey);
}
export const getPostConstruct = (target: any, propertyKey: string): any => {
  return ReflectUtils.getMetadata(PostConstructMetadataKey, target, propertyKey);
}
