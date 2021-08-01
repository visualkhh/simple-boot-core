export interface ConstructorType<T> {
    new(...args: any[]): T;
}

/**
 * Generic `ClassDecorator` type
 */
export type GenericClassDecorator<T> = (target: T) => void;

export type MethodParameter = (target: Object, propertyKey: string | symbol, parameterIndex: number) => void;

