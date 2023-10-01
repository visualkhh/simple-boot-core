import { ConstructorType } from '../types/Types';
import { SimConfig, SimMetadataKey } from '../decorators/SimDecorator';
import { SimstanceManager } from './SimstanceManager';
import { ReflectUtils } from '../utils/reflect/ReflectUtils';

export class SimAtomic<T = object> {
    constructor(public type: ConstructorType<T>|Function, private simstanceManager: SimstanceManager) {
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
        return this.simstanceManager.getOrNewSim(this.type);
    }
}
