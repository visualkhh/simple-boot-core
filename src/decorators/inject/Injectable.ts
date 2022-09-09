/**
 * @deprecated
 */
// import 'reflect-metadata'
// import {ConstructorType, GenericClassDecorator} from '../../types/Types'
// import {ReflectUtils} from '../../utils/reflect/ReflectUtils';
//
// export interface InjectableConfig {
//     scheme?: string,
// }
//
// const InjectorbleMetadataKey = Symbol('Injectable');
// export const Injectable = (config?: InjectableConfig): GenericClassDecorator<ConstructorType<any>> => {
//     return (target: ConstructorType<any>) => {
//         ReflectUtils.defineMetadata(InjectorbleMetadataKey, config, target);
//     }
// }
//
// export const getInjectable = (target: ConstructorType<any> | Function | any): InjectableConfig | undefined => {
//     if (target != null && target !== undefined && typeof target === 'object') {
//         target = target.constructor;
//     }
//     try {
//         return ReflectUtils.getMetadata(InjectorbleMetadataKey, target);
//     } catch (e) {
//     }
// }
