import "reflect-metadata"
import {ConstructorType, GenericClassDecorator, ReflectMethod} from '../types/Types'
import {ReflectUtils} from '../utils/reflect/ReflectUtils';
import {ExceptionHandlerConfig, SaveExceptionHandlerConfig} from './exception/ExceptionDecorator';

export const sims = new Set<ConstructorType<any>>();
export interface SimConfig {
    scheme?: string;
}

export const SimMetadataKey = Symbol('Sim');
export const Sim = (config: SimConfig = {}): GenericClassDecorator<ConstructorType<any>> => {
    return (target: ConstructorType<any>) => {
        // console.log('sim add-->', target, config, SimGlobal().storage)
        ReflectUtils.defineMetadata(SimMetadataKey, config, target);
        sims.add(target)
        // SimGlobal().storage.add(target);
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
