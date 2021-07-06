import {ConstructorType} from "./types/Types";
import {SimProxy} from "./proxy/SimProxy";
import {Router} from "./route/Router";
import {Module} from "./module/Module";


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
