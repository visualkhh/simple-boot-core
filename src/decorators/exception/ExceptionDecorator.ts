import 'reflect-metadata'
import {ConstructorType, ReflectMethod} from '../../types/Types';
import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
import {ObjectUtils} from '../../utils/object/ObjectUtils';

export enum ExceptionHandlerSituationType {
    ERROR_OBJECT = 'SIMPLE_BOOT_CORE://ExceptionHandler/ERROR_OBJECT',
    PARAMETER = 'SIMPLE_BOOT_CORE://ExceptionHandler/PARAMETER',
}
export type ExceptionHandlerConfig = { type?: ConstructorType<any>; throw?: boolean }
export type SaveExceptionHandlerConfig = { propertyKey?: string | symbol; method: Function; config: ExceptionHandlerConfig; }

const ExceptionHandlerMetadataKey = Symbol('ExceptionHandler');

export const ExceptionHandler = (config: ExceptionHandlerConfig = {}): ReflectMethod => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const saveMappingConfigs = (ReflectUtils.getMetadata(ExceptionHandlerMetadataKey, target.constructor) ?? []) as SaveExceptionHandlerConfig[];
        const method = target[propertyKey];
        saveMappingConfigs.push({propertyKey, method, config});
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
    const exceptionHandlers = getExceptionHandlers(target);
    const emptyTargets = exceptionHandlers?.filter(it => it.config.type === undefined);
    const targets = exceptionHandlers?.filter(it => ObjectUtils.isPrototypeOfTarget(it.config.type, error));
    const targetSorts = targets?.sort((a, b) => {
        const aPrototypeOfDepth = ObjectUtils.getPrototypeOfDepth(error, a.config.type);
        const bPrototypeOfDepth = ObjectUtils.getPrototypeOfDepth(error, b.config.type);
        return aPrototypeOfDepth.length - bPrototypeOfDepth.length
    });
    return (targetSorts ?? []).concat(...emptyTargets ?? []);
}

export const targetExceptionHandler = (target: any, error: any, excludeMethods: Function[] = []): SaveExceptionHandlerConfig | undefined => {
    let exceptionHandlers = targetExceptionHandlers(target, error);
    exceptionHandlers = exceptionHandlers?.filter(it => !excludeMethods.includes(it.method));
    if (exceptionHandlers && exceptionHandlers.length > 0) {
        return exceptionHandlers[0];
    } else {
        return undefined;
    }
}
