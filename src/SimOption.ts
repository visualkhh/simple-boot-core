import {ConstructorType} from './types/Types';

export type ProxyHandlerType = { onProxy: <T>(it: T) => T };
export type InitOptionType = { excludeSim?: (ConstructorType<any> | Function)[], advice?: ConstructorType<any>[], proxy?: ProxyHandlerType };

export class SimOption {
    public name?: string;
    public advice: ConstructorType<any>[];
    public proxy?: ProxyHandlerType;
    public excludeSim: (ConstructorType<any> | Function)[]
    constructor({excludeSim = [], advice = [], proxy}: InitOptionType = {}) {
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
