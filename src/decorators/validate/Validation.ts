import {ConstructorType, MethodParameter, ReflectField} from '../../types/Types';
import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
const ValidMetadataKey = Symbol('ValidMetadataKey');
export const Valid: MethodParameter = (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (propertyKey && typeof target === 'object') { // <-- object: method
        target = target.constructor;
        const existingRequiredParameters: number[] = Reflect.getOwnMetadata(ValidMetadataKey, target, propertyKey) || [];
        existingRequiredParameters.push(parameterIndex);
        Reflect.defineMetadata(ValidMetadataKey, existingRequiredParameters, target, propertyKey);
    } else if (!propertyKey || typeof target === 'function') { // <-- function: constructor
        const existingRequiredParameters: number[] = Reflect.getOwnMetadata(ValidMetadataKey, target) || [];
        existingRequiredParameters.push(parameterIndex);
        Reflect.defineMetadata(ValidMetadataKey, existingRequiredParameters, target);
    }
}

export const getValidIndex = (target: ConstructorType<any> | Function | any, propertyKey?: string | symbol): number[] => {
    if (target !== null && undefined !== target && typeof target === 'object') {
        target = target.constructor;
    }
    if (propertyKey) {
        const parameters: number[] = Reflect.getOwnMetadata(ValidMetadataKey, target, propertyKey);
        return parameters ?? [];
    } else {
        return ReflectUtils.getMetadata(ValidMetadataKey, target) ?? [];
    }
}

export type Validator = (value: any, ...params: any[]) => boolean;
const ValidationMetadataKey = Symbol('ValidationMetadataKey');
export type SaveValidator = {
    propertyKey: string | symbol;
    validator: Validator;
}
export const Validation = (validator: Validator): ReflectField => {
    return (target: Object, propertyKey: string | symbol) => {
        const saves = (ReflectUtils.getMetadata(ValidationMetadataKey, target.constructor) ?? []) as SaveValidator[];
        saves.push({
            propertyKey,
            validator
        });
        ReflectUtils.defineMetadata(ValidationMetadataKey, saves, target.constructor);
        ReflectUtils.defineMetadata(ValidationMetadataKey, validator, target, propertyKey);
    }
}

export const getValidator = (target: any, propertyKey: string): Validator => {
    return ReflectUtils.getMetadata(ValidationMetadataKey, target, propertyKey);
}

export const getValidators = (target: any): SaveValidator[] => {
    if (target !== null && undefined !== target && typeof target === 'object') {
        target = target.constructor;
    }
    return ReflectUtils.getMetadata(ValidationMetadataKey, target);
}

export const Regexp = (regexp: RegExp) => {
    const content: Validator = (value: any, ...params: any[]) => {
        return regexp.test(value);
    };
    return content;
}

export const NotNull: Validator = (value: any, ...params: any[]) => {
    return value !== null;
}

export const NotEmpty: Validator = (value: any, ...params: any[]) => {
    return value !== null && value !== undefined && (typeof value === 'string' && value.length > 0 || Array.isArray(value) && value.length > 0);
}

export type ValidationResult = {
    name: string;
    valid: boolean;
    message?: string;
}
export const execValidationInValid = (obj: any) => {
    return execValidation(obj).filter(it => !it.valid);
}

export const execValidation = (obj: any) => {
    const validators = getValidators(obj);
    const reesults: ValidationResult[] = [];
    validators.forEach(it => {
        reesults.push({
            name: it.propertyKey,
            valid: it.validator(it.propertyKey, it),
            message: ''
        } as ValidationResult)
    });
    return reesults;
}
