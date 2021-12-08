import "reflect-metadata"
import {ConstructorType, GenericClassDecorator} from '../types/Types'
import {SimGlobal} from '../global/SimGlobal';
import {ReflectUtils} from '../utils/reflect/ReflectUtils';

export interface SimConfig {
    scheme?: string;
}
export type RouteProperty = ConstructorType<Object> | [ConstructorType<Object>, any] | string;
export type Route = {[name: string]: RouteProperty};
export interface RouterConfig {
    path: string;
    route: Route;
    routers?: ConstructorType<Object>[];
}

export const SimMetadataKey = Symbol('Sim');
export const Sim = (config: SimConfig = {}): GenericClassDecorator<ConstructorType<any>> => {
    return (target: ConstructorType<any>) => {
        // console.log('sim add-->', target, config, SimGlobal().storage)
        ReflectUtils.defineMetadata(SimMetadataKey, config, target);
        SimGlobal().storage.add(target);
    }
}

export const getSim = (target: ConstructorType<any> | Function | any): SimConfig | undefined => {
    if (typeof target === 'object') { target = target.constructor; }
    try { return ReflectUtils.getMetadata(SimMetadataKey, target); } catch (e) {}
}

export const RouterMetadataKey = Symbol('Router');
export const Router = (config?: RouterConfig): GenericClassDecorator<ConstructorType<any>> => {
    return (target: ConstructorType<any>) => {
        ReflectUtils.defineMetadata(RouterMetadataKey, config, target);
    }
}

export const getRouter = (target: ConstructorType<any> | Function | any): RouterConfig | undefined => {
    if (typeof target === 'object') { target = target.constructor; }
    try { return ReflectUtils.getMetadata(RouterMetadataKey, target); } catch (e) {}
}

const PostConstructMetadataKey = Symbol('PostConstruct');
export const PostConstruct = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    ReflectUtils.defineMetadata(PostConstructMetadataKey, PostConstructMetadataKey, target, propertyKey);
}
export const getPostConstruct = (target: any, propertyKey: string): any => {
    return ReflectUtils.getMetadata(PostConstructMetadataKey, target, propertyKey);
}
