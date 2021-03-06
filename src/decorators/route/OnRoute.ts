import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
import {ReflectMethod, ConstructorType} from '../../types/Types';

type OnRouteOption = { isActivateMe?: boolean }

export const onRoutes = new Map<ConstructorType<any>, string[]>();

export const OnRouteMetadataKey = Symbol('OnRoute');

export const OnRoute = (config?: OnRouteOption): ReflectMethod => {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (null != target && undefined != target && typeof target === 'object') {
            target = target.constructor;
        }
        if (!onRoutes.get(target)) {
            onRoutes.set(target, []);
        }
        onRoutes.get(target)?.push(propertyKey);
        ReflectUtils.defineMetadata(OnRouteMetadataKey, config, target, propertyKey);
        const metadata = ReflectUtils.getMetadata(OnRouteMetadataKey, target, propertyKey);
    };
}

export const getOnRoute = (target: any, propertyKey: string): OnRouteOption => {
    if (null != target && undefined != target && typeof target === 'object') {
        target = target.constructor;
    }
    return ReflectUtils.getMetadata(OnRouteMetadataKey, target, propertyKey);
}
