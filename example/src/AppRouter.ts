import {Router} from "simple-boot-core/route/Router";
import {Module} from "simple-boot-core/module/Module";
import {A} from "./A";
import {B} from "./B";
import {CustomModule} from "./CustomModule";
import {Sim} from "simple-boot-core/decorators/SimDecorator";
import {CustomRouter} from "./CustomRouter";
import {Intent} from "simple-boot-core/intent/Intent";
import {ConstructorType} from "simple-boot-core/types/Types";
import {UserRouter} from "./users/UserRouter";

@Sim()
export class AppRouter extends CustomRouter {
    '' = A;
    '/' = A;
    '/b' = B;
    '/b/:aa/vv' = B;


    constructor() {
        super('', [UserRouter]);
    }

    notFound(url: Intent): ConstructorType<Module> | undefined {
        console.log('notfound--->');
        return undefined
        // return super.notFound(url);
    }
}
