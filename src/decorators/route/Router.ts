import {ConstructorType, GenericClassDecorator, ReflectMethod} from '../../types/Types';
import {ReflectUtils} from '../../utils/reflect/ReflectUtils';

export type RouteTargetMethod = {target: ConstructorType<Object>, propertyKeys: (string|symbol)[]}
export type RouteProperty = ConstructorType<Object> | [ConstructorType<Object>, any] | RouteTargetMethod | string;
export type Route = {[name: string]: RouteProperty};
export interface RouterConfig {
    path?: string;
    route?: Route;
    routers?: ConstructorType<Object>[];
}

export const RouterMetadataKey = Symbol('Router');
const routerProcess = (config: RouterConfig, target: ConstructorType<any>) => {
    getRoutes(target)?.forEach(it => {
        config.route = (config.route ?? {});
        const paths = Array.isArray(it.config.path) ? it.config.path : [it.config.path];
        for (let path of paths) {
            if (config.route[path]) {
                (config.route[path] as RouteTargetMethod).propertyKeys.push(it.propertyKey);
            } else {
                config.route[path] = {target, propertyKeys: [it.propertyKey]} as RouteTargetMethod;
            }

        }
    });
    ReflectUtils.defineMetadata(RouterMetadataKey, config, target);
}
export function Router(target: ConstructorType<any>): void;
export function Router(config: RouterConfig): GenericClassDecorator<ConstructorType<any>>;
export function Router(configOrTarget: RouterConfig | ConstructorType<any>): void | GenericClassDecorator<ConstructorType<any>> {
    if (typeof configOrTarget === 'function') {
        const routerConfig: RouterConfig = {
            path: ''
        }
        routerProcess(routerConfig, configOrTarget);
    } else {
        return (target: ConstructorType<any>) => {
            configOrTarget.path = configOrTarget.path ?? '';
            routerProcess(configOrTarget, target);
        }
    }
}

export const getRouter = (target: ConstructorType<any> | Function | any): RouterConfig | undefined => {
    if (target != null && typeof target === 'object') {
        target = target.constructor;
    }
    try { return ReflectUtils.getMetadata(RouterMetadataKey, target); } catch (e) {}
}

type RouteConfig = { path: string | string[] }
export type SaveRouteConfig = { propertyKey: string | symbol; method: Function; config: RouteConfig; }
export const RouteMetadataKey = Symbol('RouteMetadataKey');
export const Route = (config: RouteConfig): ReflectMethod => {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const saveRouteConfigs = (ReflectUtils.getMetadata(RouteMetadataKey, target.constructor) ?? []) as SaveRouteConfig[];
        const method = target[propertyKey];
        saveRouteConfigs.push({propertyKey, method, config});
        ReflectUtils.defineMetadata(RouteMetadataKey, saveRouteConfigs, target.constructor);
        ReflectUtils.defineMetadata(RouteMetadataKey, config, target, propertyKey);
    };
}

export const getRoute = (target: any, propertyKey: string | symbol): RouteConfig | undefined => {
    return ReflectUtils.getMetadata(RouteMetadataKey, target, propertyKey);
}

export const getRoutes = (target: any): SaveRouteConfig[] | undefined => {
    if (target !== null && undefined !== target && typeof target === 'object') {
        target = target.constructor;
    }
    return ReflectUtils.getMetadata(RouteMetadataKey, target);
}
