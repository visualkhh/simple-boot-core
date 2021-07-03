import {Module} from 'simple-boot-core/module/Module';
import {Sim} from "simple-boot-core/decorators/SimDecorator";
import {A} from "./A";
import {UserNotFound} from "./exceptions/UserNotFound";
import {After, Before} from "simple-boot-core/decorators/aop/AOPDecorator";
import {Intent} from "simple-boot-core/intent/Intent";

@Sim()
export class B extends Module {

    constructor(private a: A) {
        super();
        console.log('--->b')
    }

    print(){
        this.a.print();
        console.log('bbb print')
    }

    err() {
        this.publish(new Intent('A://gogo', 'ddddddddddd'));
        this.publish(new Intent('A://gogo', '444'));
        this.publish(new Intent('A://gogo', '55'));
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
