import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
import {ReflectMethod} from '../../types/Types';

export type InjectionConfig = {}

const InjectionMetadataKey = Symbol('Injection');
export const Injection = (config?: InjectionConfig): ReflectMethod => {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        ReflectUtils.defineMetadata(InjectionMetadataKey, config ?? {}, target, propertyKey);
    }
}

export const getInjection = (target: any, propertyKey: string | symbol): InjectionConfig | undefined => {
    return ReflectUtils.getMetadata(InjectionMetadataKey, target, propertyKey);
}
