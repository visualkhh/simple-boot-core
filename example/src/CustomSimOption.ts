import {SimOption} from "simple-boot-core/SimOption";
import {ConstructorType} from "simple-boot-core/types/Types";
import {Module} from "simple-boot-core/module/Module";
import {Router} from "simple-boot-core/route/Router";

export class CustomSimOption extends SimOption {
    constructor(advice: ConstructorType<any>[]) {
        super(advice);
    }
}
