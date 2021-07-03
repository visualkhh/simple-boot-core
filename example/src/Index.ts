import {SimpleApplication} from "simple-boot-core/SimpleApplication";
import {A} from "./A";
import {B} from "./B";
import {SimOption} from "simple-boot-core/SimOption";
import {GlobalAdvice} from "./GlobalAdvice";
import {ConstructorType} from "simple-boot-core/types/Types";
import {CustomSimOption} from "./CustomSimOption";


const option = new CustomSimOption([GlobalAdvice]);
const simpleApplication = new SimpleApplication(option);
simpleApplication.run();
console.log('-->', simpleApplication)
let orNewSim = simpleApplication.simstanceManager.getOrNewSim(B);
orNewSim?.print();
orNewSim.err();
