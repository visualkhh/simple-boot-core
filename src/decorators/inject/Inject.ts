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

    constructor(containers?: SituationTypeContainer[]) {
        if (containers) {
            this.containers.push(...containers);
        }
    }

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
    argument?: any;
    applyProxy?: { type: ConstructorType<ProxyHandler<any>>, param?: any[] };
    disabled?: boolean;
}

export type SaveInjectConfig = {
    index: number;
    type?: ConstructorType<any>;
    propertyKey?: string | symbol;
    config: InjectConfig;
}

const InjectMetadataKey = Symbol('Inject');
const injectProcess = (config: InjectConfig, target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (propertyKey && typeof target === 'object') { // <-- object: method
        const otarget = target;
        target = target.constructor;
        const saves = (Reflect.getOwnMetadata(InjectMetadataKey, target, propertyKey) || []) as SaveInjectConfig[];
        const type = ReflectUtils.getParameterTypes(otarget, propertyKey)[parameterIndex];
        saves.push({index: parameterIndex, config: config, propertyKey, type});
        ReflectUtils.defineMetadata(InjectMetadataKey, saves, target, propertyKey);
    } else if (!propertyKey || typeof target === 'function') { // <-- function: constructor
        const existingInjectdParameters = (ReflectUtils.getMetadata(InjectMetadataKey, target) || []) as SaveInjectConfig[]
        const type = ReflectUtils.getParameterTypes(target)[parameterIndex];
        existingInjectdParameters.push({index: parameterIndex, config: config, type});
        ReflectUtils.defineMetadata(InjectMetadataKey, existingInjectdParameters, target);
    }
}
export function Inject(target: Object, propertyKey: string | symbol | undefined, parameterIndex: number): void;
export function Inject(config: InjectConfig): MethodParameter;
export function Inject(configOrTarget: Object | InjectConfig, propertyKey?: string | symbol | undefined, parameterIndex?: number): void | MethodParameter {
    if (propertyKey && parameterIndex !== undefined) {
        injectProcess({}, configOrTarget, propertyKey, parameterIndex);
    } else {
        return (target: Object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
            injectProcess(configOrTarget, target, propertyKey, parameterIndex);
        }
    }
}

export const getInject = (target: ConstructorType<any> | Function | any, propertyKey?: string | symbol): SaveInjectConfig[] => {
    if (target != null && target !== undefined && typeof target === 'object') {
        target = target.constructor;
    }
    if (propertyKey) {
        const parameters: SaveInjectConfig[] = Reflect.getOwnMetadata(InjectMetadataKey, target, propertyKey);
        return parameters;
    } else {
        return ReflectUtils.getMetadata(InjectMetadataKey, target);
    }
}
