import {CustomModule} from "../CustomModule";
import {Sim} from "simple-boot-core/decorators/SimDecorator";

@Sim()
export class UserDetaile extends CustomModule{
    public print() {
        console.log('UserDetaile--ppppppppp')
    }
}
