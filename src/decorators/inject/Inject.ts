import {ConstructorType, GenericClassDecorator, MethodParameter} from '../../types/Types'
import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
import {FunctionUtils} from "../../utils/function/FunctionUtils";
export interface InjectConfig {
    scheme?: string;
    type?: ConstructorType<any>;
    applyProxy?: {type: ConstructorType<ProxyHandler<any>>, param?: any[]};
}
const InjectMetadataKey = Symbol('Inject');
export const Inject = (config: InjectConfig = {}): MethodParameter => {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        // const existingInjectdParameters: number[] = Reflect.getOwnMetadata(InjectMetadataKey, target, propertyKey) || [];
        // existingInjectdParameters.push(parameterIndex);
        // console.log(target, propertyKey, parameterIndex, existingInjectdParameters);
        if (!propertyKey || typeof target === 'function') {
            propertyKey = FunctionUtils.getParameterNames(target as Function)[parameterIndex];
        } else if (propertyKey && typeof target === 'object') {
            target = (target as any)[propertyKey];
            propertyKey = FunctionUtils.getParameterNames(target as Function)[parameterIndex];
        }
        ReflectUtils.defineMetadata(InjectMetadataKey, config, target, String(parameterIndex));
        // ReflectUtils.defineMetadata(InjectMetadataKey, config, target, propertyKey);
        // Reflect.defineMetadata( requiredMetadataKey, existingRequiredParameters, target, propertyKey);
    }
}

export const getInject = (target: ConstructorType<any> | Function | any, propertyKey: string): InjectConfig | undefined => {
    // console.log('000>>', target, typeof target)
    // const constructor = target.constructor;

    if (typeof target === 'object') {
        target = target.constructor;
    }
    try {
        return ReflectUtils.getMetadata(InjectMetadataKey, target, propertyKey);
        // return Reflect.getMetadata(SimMetadataKey, target.prototype);
    } catch (e) {
    }
}
