
import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
import {ReflectMethod} from '../../types/Types';

export type InjectionConfig = {}

const InjectionMetadataKey = Symbol('Injection');
export function Injection(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function Injection(config?: InjectionConfig): ReflectMethod;
export function Injection(configOrTarget?: InjectionConfig | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): void | ReflectMethod {
    if (propertyKey && descriptor) {
        const target = configOrTarget;
        ReflectUtils.defineMetadata(InjectionMetadataKey, {}, target, propertyKey);
    } else {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            const config = configOrTarget;
            ReflectUtils.defineMetadata(InjectionMetadataKey, config ?? {}, target, propertyKey);
        }
    }
}

export const getInjection = (target: any, propertyKey: string | symbol): InjectionConfig | undefined => {
    return ReflectUtils.getMetadata(InjectionMetadataKey, target, propertyKey);
}
