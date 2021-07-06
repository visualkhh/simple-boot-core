import {Sim} from "simple-boot-core/decorators/SimDecorator";
import {A} from "./A";
import {UserNotFound} from "./exceptions/UserNotFound";
import {Intent} from "simple-boot-core/intent/Intent";
import {CustomSimOption} from "./CustomSimOption";
import {CustomModule} from "./CustomModule";

@Sim()
export class B extends CustomModule {

    constructor(private a: A, private option: CustomSimOption) {
        super();
        console.log('--->b', option)
    }

    print() {
        this.a.print();
        console.log('bbb print')
    }

    err() {
        this.publish(new Intent('A://gogo?a=55', 'ddddddddddd'));
        this.publish(new Intent('A://gogo?bb=44&ff=44', '444'));
        this.publish(new Intent('A://gogo?gg=55&sadfsdf=444', '55'));
        throw new UserNotFound('good');
    }

    // @Before({property: 'print'})
    // before() {
    //     console.log('-------')
    // }
    //
    // @After({property: 'print'})
    // after() {
    //     console.log('---end----')
    // }
}
