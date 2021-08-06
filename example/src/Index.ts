import {SimpleApplication} from "simple-boot-core/SimpleApplication";
import {GlobalAdvice} from "./GlobalAdvice";
import {CustomSimOption} from "./CustomSimOption";
import {AppRouter} from "./AppRouter";
import {Intent} from "simple-boot-core/intent/Intent";
import { User } from 'src/users/User';
import { SimAtomic } from 'simple-boot-core/simstance/SimAtomic';

const option = new CustomSimOption([GlobalAdvice]);
const simpleApplication = new SimpleApplication(AppRouter, option);
simpleApplication.run();
const url = '/users/d51515dd';
// const url = '/b/asdf/vv';
simpleApplication.routing<SimAtomic<any>, any>(new Intent(url)).then(it => {
    // it.router;
    // const m = it.module
    console.log('--->', it.pathData);
    let moduleInstance = it.getModuleInstance<User>();
    moduleInstance.print();
    console.log('-22->', moduleInstance);

    // simpleApplication.publishIntent(new Intent('A://gogo?a=55', 'ddddddddddd'));
});

//
// console.log('-->', simpleApplication)
// let orNewSim = simpleApplication.simstanceManager.getOrNewSim(B);
// orNewSim?.print();
// orNewSim.err();
