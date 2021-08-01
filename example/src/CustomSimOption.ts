import {SimOption} from "simple-boot-core/SimOption";
import {ConstructorType} from "simple-boot-core/types/Types";

export class CustomSimOption extends SimOption {
    constructor(advice: ConstructorType<any>[]) {
        super(advice);
    }
}
