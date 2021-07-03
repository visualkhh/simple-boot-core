import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
import {FromEventTarget} from 'rxjs/internal/observable/fromEvent';

export interface EventListenerOption {
    target: string|any|FromEventTarget<any>;
    name: string;
}
const EventListenerMetadataKey = Symbol('EventListener');
export const EventListener = (option: EventListenerOption) => {
    return ReflectUtils.metadata(EventListenerMetadataKey, option);
}

export const getEventListener = (target: any, propertyKey: string): EventListenerOption => {
    return ReflectUtils.getMetadata(EventListenerMetadataKey, target, propertyKey);
}
