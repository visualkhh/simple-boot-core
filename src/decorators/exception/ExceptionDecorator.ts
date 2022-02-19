import 'reflect-metadata'
import {ConstructorType, ReflectMethod} from '../../types/Types';
import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
import {ObjectUtils} from '../../utils/object/ObjectUtils';

export enum ExceptionHandlerSituationType {
    ERROR_OBJECT = 'SIMPLE_BOOT_CORE://ExceptionHandler/ERROR_OBJECT',
}
export type ExceptionHandlerConfig = { type?: ConstructorType<any>; }
export type SaveExceptionHandlerConfig = { propertyKey?: string | symbol; config: ExceptionHandlerConfig; }

const ExceptionHandlerMetadataKey = Symbol('ExceptionHandler');

export const ExceptionHandler = (config: ExceptionHandlerConfig = {}): ReflectMethod => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const saveMappingConfigs = (ReflectUtils.getMetadata(ExceptionHandlerMetadataKey, target.constructor) ?? []) as SaveExceptionHandlerConfig[];
        saveMappingConfigs.push({propertyKey, config});
        ReflectUtils.defineMetadata(ExceptionHandlerMetadataKey, saveMappingConfigs, target.constructor);
        ReflectUtils.defineMetadata(ExceptionHandlerMetadataKey, config, target, propertyKey);
    }
}

export const getExceptionHandler = (target: any, propertyKey: string): ExceptionHandlerConfig => {
    return ReflectUtils.getMetadata(ExceptionHandlerMetadataKey, target, propertyKey);
}

export const getExceptionHandlers = (target: any): SaveExceptionHandlerConfig[] | undefined => {
    if (target !== null && undefined !== target && typeof target === 'object') {
        target = target.constructor;
    }
    return ReflectUtils.getMetadata(ExceptionHandlerMetadataKey, target);
}

export const targetExceptionHandlers = (target: any, error: any): SaveExceptionHandlerConfig[] => {
    // return getExceptionHandlers(target)?.filter(it => ObjectUtils.isPrototypeOfTarget(it.config.type, error))
    let exceptionHandlers = getExceptionHandlers(target);
    let emptyTargets = exceptionHandlers?.filter(it => it.config.type === undefined);
    const targets = exceptionHandlers?.filter(it => ObjectUtils.isPrototypeOfTarget(it.config.type, error));
    const targetSorts = targets?.sort((a, b) => {
        let aPrototypeOfDepth = ObjectUtils.getPrototypeOfDepth(error, a.config.type);
        let bPrototypeOfDepth = ObjectUtils.getPrototypeOfDepth(error, b.config.type);
        // console.log('-', error, a.config.type, b.config.type);
        // console.log('--', aPrototypeOfDepth, bPrototypeOfDepth);
        return aPrototypeOfDepth.length - bPrototypeOfDepth.length
    });
    return (targetSorts??[]).concat(...emptyTargets??[]);
}

export const targetExceptionHandler = (target: any, error: any): SaveExceptionHandlerConfig | undefined => {
    let exceptionHandlers = targetExceptionHandlers(target, error);
    if (exceptionHandlers && exceptionHandlers.length > 0) {
        return exceptionHandlers[0];
    } else {
        return undefined;
    }
}
//
// export const getExceptionHandlers = (target: any): MetaDataPropertyAtomic<any, ConstructorType<any> | null>[] => {
//     return ObjectUtils.getAllProtoTypeName(target)
//         .map(it => new MetaDataPropertyAtomic<any, ConstructorType<any> | null>(target, getExceptionHandler(target, it), it, ReflectUtils.getParameterTypes(target, it)))
//         .filter(it => it.metaData !== undefined) || [];
// }

// export const getTargetAndIncludeNullAndSortExceptionHandlers = (target: any, error: any): MetaDataPropertyAtomic<any, ConstructorType<any> | null>[] => {
//     return getExceptionHandlers(target).filter(it => it.metaData == null || ObjectUtils.isPrototypeOfTarget(it.metaData, error))
//         .sort((a, b) => ObjectUtils.getAllProtoType(a.metaData).length - ObjectUtils.getAllProtoType(b.metaData).length);
// }

// export const getExceptionHandlers = (target: any): MetaDataPropertyAtomic<ConstructorType<any> | null>[] => {
//     return ObjectUtils.getAllProtoTypeName(target)
//         .map(it => new MetaDataPropertyAtomic<ConstructorType<any> | null>(target, getExceptionHandler(target, it), it, ReflectUtils.getParameterTypes(target, it)))
//         .filter(it => it.metaData !== undefined) || [];
// }
