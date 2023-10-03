import {ConstructorType} from './types/Types';

export type ProxyHandlerType = { onProxy: <T>(it: T) => T };
export type InitOptionType = { container?: string, excludeSim?: (ConstructorType<any> | Function)[], advice?: ConstructorType<any>[], proxy?: ProxyHandlerType };

export class SimOption {
    public container?: string;
    public advice: ConstructorType<any>[];
    public proxy?: ProxyHandlerType;
    public excludeSim: ((ConstructorType<any> | Function)[]) | ((type: (ConstructorType<any> | Function)) => boolean);
    constructor({container, excludeSim = [], advice = [], proxy}: InitOptionType = {}) {
        this.container = container;
        this.advice = advice;
        this.excludeSim = excludeSim;
        this.proxy = proxy;
    }

    addAdvicce(advice: ConstructorType<any>) {
        this.advice.push(advice);
    }

    setAdvice(...advice: ConstructorType<any>[]): SimOption {
        this.advice = advice;
        return this;
    }
}
