import "reflect-metadata"
import {ConstructorType, GenericClassDecorator, ReflectMethod} from '../types/Types'
import {ReflectUtils} from '../utils/reflect/ReflectUtils';

export const sims = new Set<ConstructorType<any>>();
export interface SimConfig {
    scheme?: string;
}

export const SimMetadataKey = Symbol('Sim');

export function Sim (target: ConstructorType<any>): void ;
export function Sim (config: SimConfig): GenericClassDecorator<ConstructorType<any>>;
export function Sim (config: SimConfig | ConstructorType<any>): void | GenericClassDecorator<ConstructorType<any>>  {
    if (typeof config === 'function') {
        ReflectUtils.defineMetadata(SimMetadataKey, {}, config);
        sims.add(config);
    } else {
        return (target: ConstructorType<any>) => {
            ReflectUtils.defineMetadata(SimMetadataKey, config, target);
            sims.add(target);
        }
    }
}


export const getSim = (target: ConstructorType<any> | Function | any): SimConfig | undefined => {
    if (null != target && undefined != target && typeof target === 'object') {
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
