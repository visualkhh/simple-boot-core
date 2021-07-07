import {SimpleApplication} from "simple-boot-core/SimpleApplication";
import {GlobalAdvice} from "./GlobalAdvice";
import {CustomSimOption} from "./CustomSimOption";
import {AppRouter} from "./AppRouter";
import {Intent} from "simple-boot-core/intent/Intent";
import {CustomModule} from "./CustomModule";
import {B} from "./B";
import {CustomRouter} from "./CustomRouter";

const option = new CustomSimOption([GlobalAdvice]);
// const simpleApplication = new SimpleApplication<AppRouter, CustomModule>(AppRouter, option);
const simpleApplication = new SimpleApplication(AppRouter, option);
// const simpleApplication = new SimpleApplication(AppRouter, option);
simpleApplication.run();
simpleApplication.routing<CustomRouter, CustomModule>(new Intent('/zzb')).then(it => {
    it.router;
    const m = it.module
    let moduleInstance = it.getModuleInstance<B>();
    moduleInstance.err();
    console.log('-22->', moduleInstance, it.router);

    simpleApplication.publishIntent(new Intent('A://gogo?a=55', 'ddddddddddd'));
});

//
// console.log('-->', simpleApplication)
// let orNewSim = simpleApplication.simstanceManager.getOrNewSim(B);
// orNewSim?.print();
// orNewSim.err();
