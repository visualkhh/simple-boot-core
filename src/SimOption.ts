import {ConstructorType} from "./types/Types";
import {SimProxy} from "./proxy/SimProxy";

export class SimOption {

    constructor(public advice: ConstructorType<any>[] = [], public simProxy?: SimProxy) {
    }

    addAdvicce(advice: ConstructorType<any>) {
        this.advice.push(advice);
    }

    setAdvice(...advice: ConstructorType<any>[]): SimOption {
        this.advice = advice;
        return this;
    }
}
