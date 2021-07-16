import {CustomModule} from "../CustomModule";
import {Sim} from "simple-boot-core/decorators/SimDecorator";

@Sim()
export class User extends CustomModule{
    public print() {
        console.log('user')
    }
}
