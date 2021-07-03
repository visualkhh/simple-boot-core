import {Module} from 'simple-boot-core/module/Module';
import {Sim} from "simple-boot-core/decorators/SimDecorator";
import {Intent} from "simple-boot-core/intent/Intent";

@Sim({scheme: 'A'})
export class A extends Module {

    constructor() {
        super();
        console.log('--->aA')
    }

    print(){
        console.log('print')
    }

    gogo(intent: Intent) {
        console.log('gogogo', intent);
    }

}
