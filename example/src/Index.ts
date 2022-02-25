import {SimpleApplication} from "simple-boot-core/SimpleApplication";
import {GlobalAdvice} from "./GlobalAdvice";
import {AppRouter} from "./AppRouter";
import {Intent} from "simple-boot-core/intent/Intent";
import {User} from 'src/users/User';
import {SimAtomic} from 'simple-boot-core/simstance/SimAtomic';
import {SimOption} from 'simple-boot-core/SimOption';

const option = new SimOption([GlobalAdvice]);
const simpleApplication = new SimpleApplication(AppRouter, option);
simpleApplication.run();
const intent = new Intent('/goodjob');
simpleApplication.routing<SimAtomic<any>, any>(intent).then(it => {
    // console.log('--->', it);
    // console.log('--->', it.pathData, it.routerChains);
    // let moduleInstance = it.getModuleInstance<User>();
    let moduleInstance = it.executeModuleProperty();
    console.log('-22->', moduleInstance);
    // try {
        // moduleInstance?.print();
    // } catch (e) {
    // }
    // console.log('------->' , simpleApplication.routerManager.activeRouterModule)
});

