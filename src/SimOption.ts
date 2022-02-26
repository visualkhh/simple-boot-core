import {ConstructorType} from './types/Types';

export class SimOption {
    public name?: string;

    constructor(public advice: ConstructorType<any>[] = [], public proxy?: { onProxy: <T>(it: T) => T }) {
    }

    addAdvicce(advice: ConstructorType<any>) {
        this.advice.push(advice);
    }

    setAdvice(...advice: ConstructorType<any>[]): SimOption {
        this.advice = advice;
        return this;
    }
}
