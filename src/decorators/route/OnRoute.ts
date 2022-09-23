import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
import {ReflectMethod, ConstructorType} from '../../types/Types';

type OnRouteOption = { isActivateMe?: boolean }

export const onRoutes = new Map<ConstructorType<any>, (string | symbol)[]>();

export const OnRouteMetadataKey = Symbol('OnRoute');

const onRouteProcess = (config: OnRouteOption, target: any, propertyKey: string | symbol, description: PropertyDescriptor) => {
    if (target !== null && undefined !== target && typeof target === 'object') {
        target = target.constructor;
    }
    if (!onRoutes.get(target)) {
        onRoutes.set(target, []);
    }
    onRoutes.get(target)?.push(propertyKey);
    ReflectUtils.defineMetadata(OnRouteMetadataKey, config, target, propertyKey);
    // const metadata = ReflectUtils.getMetadata(OnRouteMetadataKey, target, propertyKey);
}
export function OnRoute(target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor): void;
export function OnRoute(config?: OnRouteOption): ReflectMethod;
export function OnRoute(configOrTarget?: OnRouteOption | any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor): void | ReflectMethod {
    if (propertyKey && descriptor) {
        onRouteProcess({}, configOrTarget, propertyKey, descriptor);
    } else {
        return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            onRouteProcess(configOrTarget, target, propertyKey, descriptor);
        }
    }
    // return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    //     if (null != target && undefined != target && typeof target === 'object') {
    //         target = target.constructor;
    //     }
    //     if (!onRoutes.get(target)) {
    //         onRoutes.set(target, []);
    //     }
    //     onRoutes.get(target)?.push(propertyKey);
    //     ReflectUtils.defineMetadata(OnRouteMetadataKey, config, target, propertyKey);
    //     const metadata = ReflectUtils.getMetadata(OnRouteMetadataKey, target, propertyKey);
    // };
}

export const getOnRoute = (target: any, propertyKey: string | symbol): OnRouteOption => {
    if (target !== null && undefined !== target && typeof target === 'object') {
        target = target.constructor;
    }
    return ReflectUtils.getMetadata(OnRouteMetadataKey, target, propertyKey);
}
