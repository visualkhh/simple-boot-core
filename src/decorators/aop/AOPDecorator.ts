import 'reflect-metadata'
import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
import {MetaDataPropertyAtomic} from '../MetaDataAtomic';
import {ObjectUtils} from '../../utils/object/ObjectUtils';
import { ConstructorType, ReflectMethod } from '../../types/Types';

const AfterMetadataKey = Symbol('After');
const BeforeMetadataKey = Symbol('Before');
const AroundMetadataKey = Symbol('Around');
type AOPOption = {type?: ConstructorType<any>, property: string}
type AroundOption = {after?: (obj: any, propertyKey: string, args: any[], beforeReturn: any) => any[], before?: (obj: any, propertyKey: string, args: any[]) => any[]}

// after
export const After = (data: AOPOption) => {
    return ReflectUtils.metadata(AfterMetadataKey, data);
}
export const getAfter = (target: any, propertyKey: string): AOPOption => {
    return ReflectUtils.getMetadata(AfterMetadataKey, target, propertyKey);
}

export const getAfters = (target: any): MetaDataPropertyAtomic<any, AOPOption>[] => {
    return ObjectUtils.getAllProtoTypeName(target)
        .map(it => new MetaDataPropertyAtomic<any, AOPOption>(target, getAfter(target, it), it))
        .filter(it => it.metaData !== undefined) || [];
}

export const getProtoAfters = (target: any, propertyKey: string, type?: ConstructorType<any>): MetaDataPropertyAtomic<any, AOPOption>[] => {
    return getAfters(target).filter(it => propertyKey === it.metaData.property && type === it.metaData.type?.prototype) || [];
}

// before
export const Before = (data: AOPOption) => {
    return ReflectUtils.metadata(BeforeMetadataKey, data);
}

export const getBefore = (target: any, propertyKey: string): AOPOption => {
    return ReflectUtils.getMetadata(BeforeMetadataKey, target, propertyKey);
}

export const getBefores = (target: any): MetaDataPropertyAtomic<any, AOPOption>[] => {
    return ObjectUtils.getAllProtoTypeName(target)
        .map(it => new MetaDataPropertyAtomic<any, AOPOption>(target, getBefore(target, it), it))
        .filter(it => it.metaData !== undefined) || [];
}

export const getProtoBefores = (target: any, propertyKey: string, type?: ConstructorType<any>): MetaDataPropertyAtomic<any, AOPOption>[] => {
    return getBefores(target).filter(it => propertyKey === it.metaData.property && type === it.metaData.type?.prototype) || [];
}

export class AroundForceReturn {
    constructor(public value: any) {
    }
}
// around
export const Around = (config: AroundOption):  ReflectMethod => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        ReflectUtils.defineMetadata(AroundMetadataKey, config, target, propertyKey);

        const method = descriptor.value;
        descriptor.value = function (...args: any[]) {
            // console.log('check method')

            let before = undefined;
            let r = undefined;
            if (config.before) {
                try{
                    before = config.before?.(this, propertyKey, args);
                } catch (e){
                    if (e instanceof AroundForceReturn) {
                        return e.value;
                    }
                }
                r = method.apply(this, before);
            } else {
                r = method.apply(this, args);
            }

            if (config.after) {
                try{
                    r = config.after?.(this, propertyKey, args, r);
                } catch (e){
                    if (e instanceof AroundForceReturn) {
                        return e.value;
                    }
                }
            }
            return r;
        }
    }
}

export const getAround = (target: any, propertyKey: string): AroundOption => {
    return ReflectUtils.getMetadata(AroundMetadataKey, target, propertyKey);
}
