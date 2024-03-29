import { ConstructorType } from '../types/Types';
import { SimConfig, SimMetadataKey } from '../decorators/SimDecorator';
import { SimstanceManager } from './SimstanceManager';
import { ReflectUtils } from '../utils/reflect/ReflectUtils';
import { ConvertUtils } from '../utils/convert/ConvertUtils';

export class SimAtomic<T = object> {
  constructor(public type: ConstructorType<T> | Function, private simstanceManager: SimstanceManager) {
  }

  getConfig(): SimConfig | undefined;
  getConfig<C = any>(key: symbol): C | undefined;
  getConfig<C = any>(key: symbol = SimMetadataKey): C | undefined {
    return ReflectUtils.getMetadata(key, this.type);
  }

  getConfigs() {
    return ReflectUtils.getMetadatas(this.type);
  }

  get value(): T | undefined {
    // console.log('------value?', this.type, this.simstanceManager.storage)
    return this.simstanceManager.getOrNewSim(this.type);
    // const types = ConvertUtils.flatArray(this.getConfig()?.type);
    // types.push(this.type);
    // for (const typeElement of types) {
    //   const instance = this.simstanceManager.getOrNewSim(typeElement, this.type);
    //   if (instance) {
    //     return instance;
    //   }
    // }
  }
}
