import "reflect-metadata"
import {ConstructorType, GenericClassDecorator, MethodParameter} from '../../types/Types'
import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
import {FunctionUtils} from "../../utils/function/FunctionUtils";

export type SaveInjectConfig ={
    index: number;
    propertyKey?: string | symbol;
    config: InjectConfig;
}
export type InjectConfig = {
    scheme?: string;
    type?: ConstructorType<any>;
    applyProxy?: {type: ConstructorType<ProxyHandler<any>>, param?: any[]};
}
const InjectMetadataKey = Symbol('Inject');
export const Inject = (config: InjectConfig = {}): MethodParameter => {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        //target type (function: constructor,  object: method)
        // console.group('Inject');
        // console.log('Inject!!', target, propertyKey, parameterIndex, typeof target);
        if (propertyKey && typeof target === 'object') { // <-- object: method
            target = target.constructor;
            // console.group('Inject sub');
            const existingInjectdParameters = (Reflect.getOwnMetadata(InjectMetadataKey, target, propertyKey) || []) as SaveInjectConfig[];
            existingInjectdParameters.push({index: parameterIndex, config, propertyKey});
            ReflectUtils.defineMetadata(InjectMetadataKey, existingInjectdParameters, target, propertyKey);
            // console.log('Inject-', existingInjectdParameters);
            // console.groupEnd();
        } else if (!propertyKey || typeof target === 'function') { // <-- function: constructor
            const existingInjectdParameters = (ReflectUtils.getMetadata(InjectMetadataKey, target) || []) as SaveInjectConfig[]
            existingInjectdParameters.push({index: parameterIndex, config});
            ReflectUtils.defineMetadata(InjectMetadataKey, existingInjectdParameters, target);
        }
        // console.groupEnd();
    }
}

export const getInject = (target: ConstructorType<any> | Function | any, propertyKey?: string | symbol): SaveInjectConfig[] => {
    if (null != target && undefined != target && typeof target === 'object') {
        target = target.constructor;
    }
    if (propertyKey) {
        let parameters: SaveInjectConfig[] = Reflect.getOwnMetadata(InjectMetadataKey, target, propertyKey);
        return parameters;
    } else {
        return ReflectUtils.getMetadata(InjectMetadataKey, target);
    }
}
