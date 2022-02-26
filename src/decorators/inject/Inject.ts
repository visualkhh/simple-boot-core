import 'reflect-metadata'
import {ConstructorType, MethodParameter} from '../../types/Types'
import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
import {ExceptionHandlerSituationType} from '../exception/ExceptionDecorator';

export enum InjectSituationType {
    INDEX = 'SIMPLE_BOOT_CORE://Inject/INDEX',
}

export type SituationType = string | InjectSituationType | ExceptionHandlerSituationType;

export class SituationTypeContainer {
    public situationType: SituationType;
    public data: any;
    public index?: number;

    constructor({situationType, data, index}: { situationType: SituationType, data: any, index?: number }) {
        this.situationType = situationType;
        this.data = data;
        this.index = index;
    }
}

export class SituationTypeContainers {
    public containers: SituationTypeContainer[] = [];

    public push(...item: SituationTypeContainer[]) {
        this.containers.push(...item)
    }

    get length() {
        return this.containers.length;
    }

    find(predicate: (value: SituationTypeContainer, index: number, obj: SituationTypeContainer[]) => unknown, thisArg?: any): SituationTypeContainer | undefined {
        return this.containers.find(predicate);
    }
}

export type InjectConfig = {
    scheme?: string;
    type?: ConstructorType<any>;
    situationType?: SituationType;
    applyProxy?: { type: ConstructorType<ProxyHandler<any>>, param?: any[] };
}

export type SaveInjectConfig = {
    index: number;
    type?: ConstructorType<any>;
    propertyKey?: string | symbol;
    config: InjectConfig;
}

const InjectMetadataKey = Symbol('Inject');
export const Inject = (config: InjectConfig = {}): MethodParameter => {
    return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
        if (propertyKey && typeof target === 'object') { // <-- object: method
            const otarget = target;
            target = target.constructor;
            const saves = (Reflect.getOwnMetadata(InjectMetadataKey, target, propertyKey) || []) as SaveInjectConfig[];
            const type = ReflectUtils.getParameterTypes(otarget, propertyKey)[parameterIndex];
            saves.push({index: parameterIndex, config, propertyKey, type});
            ReflectUtils.defineMetadata(InjectMetadataKey, saves, target, propertyKey);
        } else if (!propertyKey || typeof target === 'function') { // <-- function: constructor
            const existingInjectdParameters = (ReflectUtils.getMetadata(InjectMetadataKey, target) || []) as SaveInjectConfig[]
            const type = ReflectUtils.getParameterTypes(target)[parameterIndex];
            existingInjectdParameters.push({index: parameterIndex, config, type});
            ReflectUtils.defineMetadata(InjectMetadataKey, existingInjectdParameters, target);
        }
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
