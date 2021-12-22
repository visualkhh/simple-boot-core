import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
import {ReflectMethod} from '../../types/Types';

type OnRouteOption = { hasChild?: boolean }

export const onRoutes = new Map<any, string[]>();

export const OnRouteMetadataKey = Symbol('OnRoute');

export const OnRoute = (config?: OnRouteOption): ReflectMethod => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (!onRoutes.get(target)) {
            onRoutes.set(target, []);
        }
        onRoutes.get(target)?.push(propertyKey);
        ReflectUtils.defineMetadata(OnRouteMetadataKey, config, target, propertyKey);
    };
}

export const getOnRoute = (target: any, propertyKey: string): any => {
    if (null != target && undefined != target && typeof target === 'object') {
        target = target.constructor;
    }
    return ReflectUtils.getMetadata(OnRouteMetadataKey, target, propertyKey);
}
