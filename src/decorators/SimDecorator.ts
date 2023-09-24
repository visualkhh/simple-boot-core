import 'reflect-metadata'
import {ConstructorType, GenericClassDecorator} from '../types/Types'
import {ReflectUtils} from '../utils/reflect/ReflectUtils';

export enum Lifecycle {
    /**
     * Each resolve will return the same instance (including resolves from child containers)
     */
    Singleton = 'Singleton',
    /**
     * The default registration scope, a new instance will be created with each resolve
     */
    Transient = 'Transient'
}

export const sims = new Map<ConstructorType<any> | Function, Set<ConstructorType<any> | Function>>();
export interface SimConfig {
    symbol?: Symbol;
    scheme?: string;
    scope?: Lifecycle;
    type?: ConstructorType<any> | ConstructorType<any>[];
    using?: (ConstructorType<any>)[];
}

export const SimMetadataKey = Symbol('Sim');
const simProcess = (config: SimConfig, target: ConstructorType<any> | Function) => {
    ReflectUtils.defineMetadata(SimMetadataKey, config, target);
    const adding = (targetKey: ConstructorType<any> | Function, target: ConstructorType<any> | Function = targetKey) => {
        const items = sims.get(targetKey) ?? new Set<ConstructorType<any>>();
        items.add(target);
        sims.set(targetKey, items);
    }

    // default setting
    config.scope = config?.scope ?? Lifecycle.Singleton;

    if (Array.isArray(config?.type)) {
        config?.type.forEach(it => {
            adding(it, target);
        })
    } else if (config.type) {
        adding(config?.type, target);
    } else {
        adding(target)
    }
}
export function Sim(target: ConstructorType<any> | Function): void;
export function Sim(config: SimConfig): GenericClassDecorator<ConstructorType<any>>;
export function Sim(configOrTarget: SimConfig | ConstructorType<any> | Function): void | GenericClassDecorator<ConstructorType<any>> {
    if (typeof configOrTarget === 'function') {
        simProcess({}, configOrTarget);
    } else {
        return (target: ConstructorType<any>) => {
            simProcess(configOrTarget, target);
        }
    }
}

export const getSim = (target: ConstructorType<any> | Function | any): SimConfig | undefined => {
    if (target != null && target !== undefined && typeof target === 'object') {
        target = target.constructor;
    }
    try { return ReflectUtils.getMetadata(SimMetadataKey, target); } catch (e) {}
}

const PostConstructMetadataKey = Symbol('PostConstruct');
export const PostConstruct = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ReflectUtils.defineMetadata(PostConstructMetadataKey, PostConstructMetadataKey, target, propertyKey);
}
export const getPostConstruct = (target: any, propertyKey: string): any => {
    return ReflectUtils.getMetadata(PostConstructMetadataKey, target, propertyKey);
}
