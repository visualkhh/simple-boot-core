import 'reflect-metadata'
import {ConstructorType, GenericClassDecorator} from '../types/Types'
import {ReflectUtils} from '../utils/reflect/ReflectUtils';

// export const sims = new Set<ConstructorType<any>>();
export const sims = new Map<ConstructorType<any>, Set<ConstructorType<any>>>();
export interface SimConfig {
    scheme?: string;
    type?: ConstructorType<any> | ConstructorType<any>[];
}

export const SimMetadataKey = Symbol('Sim');
const simProcess = (config: SimConfig, target: ConstructorType<any>) => {
    ReflectUtils.defineMetadata(SimMetadataKey, {}, target);
    const adding = (targetKey: ConstructorType<any>, target: ConstructorType<any> = targetKey) => {
        const items = sims.get(targetKey) ?? new Set<ConstructorType<any>>();
        items.add(target);
        sims.set(targetKey, items);
    }
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
export function Sim(target: ConstructorType<any>): void;
export function Sim(config: SimConfig): GenericClassDecorator<ConstructorType<any>>;
export function Sim(configOrTarget: SimConfig | ConstructorType<any>): void | GenericClassDecorator<ConstructorType<any>> {
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
