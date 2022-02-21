export interface ConstructorType<T> {
    new(...args: any[]): T;
}

/**
 * Generic `ClassDecorator` type
 */
export type GenericClassDecorator<T> = (target: T) => void;

export type ReflectField = (target: Object|{constructor: ConstructorType<any>, [key: string]: Function}, propertyKey: string | symbol) => void;
export type ReflectMethod = (target: any|ConstructorType<any>|{constructor: ConstructorType<any>, [key: string]: Function}, propertyKey: string, descriptor: PropertyDescriptor) => any;
export type MethodParameter = (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;
