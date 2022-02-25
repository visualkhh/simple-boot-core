import {ConstructorType, GenericClassDecorator, ReflectMethod} from '../../types/Types';
import {ReflectUtils} from '../../utils/reflect/ReflectUtils';

export type RouteTargetMethod = {target: ConstructorType<Object>, propertyKey: string}
export type RouteProperty = ConstructorType<Object> | [ConstructorType<Object>, any] | RouteTargetMethod | string;
export type Route = {[name: string]: RouteProperty};
export interface RouterConfig {
    path: string;
    route?: Route;
    routers?: ConstructorType<Object>[];
}


export const RouterMetadataKey = Symbol('Router');
export const Router = (config: RouterConfig): GenericClassDecorator<ConstructorType<any>> => {
    return (target: ConstructorType<any>) => {
        (getRoutes(target)??[]).forEach(it => {
            config.route = (config.route ?? {})
            config.route[it.config.path] = {target, propertyKey: it.propertyKey} as RouteTargetMethod;
        });
        // console.log('-->', routes);
        ReflectUtils.defineMetadata(RouterMetadataKey, config, target);
    }
}

export const getRouter = (target: ConstructorType<any> | Function | any): RouterConfig | undefined => {
    if (null != target && undefined != target && typeof target === 'object') {
        target = target.constructor;
    }
    try { return ReflectUtils.getMetadata(RouterMetadataKey, target); } catch (e) {}
}

type RouteConfig = { path: string }
export type SaveRouteConfig = { propertyKey: string | symbol; method: Function; config: RouteConfig; }
export const RouteMetadataKey = Symbol('RouteMetadataKey');
export const Route = (config: RouteConfig): ReflectMethod => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        const saveRouteConfigs = (ReflectUtils.getMetadata(RouteMetadataKey, target.constructor) ?? []) as SaveRouteConfig[];
        const method = target[propertyKey];
        saveRouteConfigs.push({propertyKey, method, config});
        ReflectUtils.defineMetadata(RouteMetadataKey, saveRouteConfigs, target.constructor);
        ReflectUtils.defineMetadata(RouteMetadataKey, config, target, propertyKey);
    };
}

export const getRoute = (target: any, propertyKey: string): RouteConfig | undefined => {
    return ReflectUtils.getMetadata(RouteMetadataKey, target, propertyKey);
}

export const getRoutes = (target: any): SaveRouteConfig[] | undefined => {
    if (target !== null && undefined !== target && typeof target === 'object') {
        target = target.constructor;
    }
    return ReflectUtils.getMetadata(RouteMetadataKey, target);
}
