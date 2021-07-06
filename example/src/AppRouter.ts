import {Router} from "simple-boot-core/route/Router";
import {Module} from "simple-boot-core/module/Module";
import {A} from "./A";
import {B} from "./B";
import {CustomModule} from "./CustomModule";
import {Sim} from "simple-boot-core/decorators/SimDecorator";
import {CustomRouter} from "./CustomRouter";

@Sim()
export class AppRouter extends CustomRouter {
    '' = A;
    '/' = A;
    '/b' = B;
}
