import {Sim} from "simple-boot-core/decorators/SimDecorator";

@Sim()
export class User {
    public print() {
        console.log('user print')
    }
}
