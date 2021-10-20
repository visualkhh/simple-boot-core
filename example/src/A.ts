import {Sim} from "simple-boot-core/decorators/SimDecorator";
import {Intent} from "simple-boot-core/intent/Intent";

@Sim({scheme: 'A'})
export class A {
    constructor() {
        console.log('--->aA')
    }

    print(){
        console.log('print')
    }

    gogo(intent: Intent) {
        console.log('gogogo', intent);
    }
}
