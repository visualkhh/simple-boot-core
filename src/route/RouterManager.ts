import 'reflect-metadata'
import {SimstanceManager} from "../simstance/SimstanceManager";
import {Router} from "./Router";
import {Module} from "../module/Module";
import {Intent} from "../intent/Intent";
import {ConstructorType} from "../types/Types";
import {RouterModule} from "./RouterModule";

export class RouterManager {
    public activeRouterModule?:RouterModule;
    constructor(private rootRouter: ConstructorType<Router>, private simstanceManager: SimstanceManager) {
    }


    public async routing(intent: Intent): Promise<RouterModule | undefined> {
        // const url = new Url
        const routers: Router[] = [];
        // const navigation = this.simstanceManager.getOrNewSim(Navigation)!;
        const rootRouter = this.simstanceManager.getOrNewSim(this.rootRouter);
        let executeModule = rootRouter?.getExecuteModule(intent, routers);
        if (!executeModule) {
            // notfound find
            let notFound;
            for (const route of routers.slice().reverse()) {
                if (route !== rootRouter) {
                    const nf = route.notFound(intent);
                    if (nf) {
                        notFound = nf;
                        break;
                    }
                }
            }
            notFound = notFound ?? rootRouter?.notFound(intent);
            return this.activeRouterModule = new RouterModule(rootRouter, notFound, routers);
        }

        if (executeModule.router) {
            executeModule.routerChains = routers;
            executeModule.module = await executeModule.router.canActivate(intent, executeModule);
            return this.activeRouterModule = executeModule;
        } else {
           return undefined;
        }
    }
}
