import 'reflect-metadata'
import {SimstanceManager} from '../simstance/SimstanceManager';
import {Intent} from '../intent/Intent';
import {ConstructorType} from '../types/Types';
import {RouterModule} from './RouterModule';
import { getSim, RouterConfig, RouterMetadataKey } from '../decorators/SimDecorator';
import { SimAtomic } from '../simstance/SimAtomic';

export class RouterManager {
    public activeRouterModule?:RouterModule;
    // public subject = new Subject<Intent>()
    constructor(private rootRouter: ConstructorType<any>, private simstanceManager: SimstanceManager) {
    }

    public async routing(intent: Intent): Promise<RouterModule | undefined> {
        // const metadata = Reflect.getMetadata('design:type', this.rootRouter);
        // const metadata = Reflect.getMetadataKeys( this.rootRouter);
        // console.log('-->', metadata)
        // console.log(getSim(this.rootRouter), getSim2(this.rootRouter));
        const routers: RouterConfig[] = [];
        const routerAtomic =  new SimAtomic(this.rootRouter);
        const rootRouterData = routerAtomic.getConfig<RouterConfig>(RouterMetadataKey)!;
        const rootRouter = routerAtomic.value!;
        let executeModule = this.getExecuteModule(rootRouterData!, intent, routers);
        if (!executeModule) {
            // notfound find
            let notFound;
            for (const route of routers.slice().reverse()) {
                if (route !== rootRouter) {
                    // const nf = route.notFound(intent);
                    // if (nf) {
                    //     notFound = nf;
                    //     break;
                    // }
                }
            }
            // notFound = notFound ?? rootRouter?.notFound(intent);
            return this.activeRouterModule = new RouterModule(rootRouter, notFound, routers);
        }

        if (executeModule.router) {
            executeModule.routerChains = routers;
            // executeModule.module = (await executeModule.router.canActivate(intent, executeModule)) ?? executeModule.module;
            executeModule.module = executeModule.module;
            return this.activeRouterModule = executeModule;
        } else {
           return undefined;
        }
    }

    private getExecuteModule(routerData: RouterConfig, intent: Intent, parentRouters: RouterConfig[]): RouterModule | undefined {
        const path = intent.pathname;
        const routerStrings = parentRouters.slice(1).map(it => it.path || '')
        const isRoot = this.isRootUrl(routerData, routerStrings, path)
        if (isRoot) {
            parentRouters.push(routerData);
            const module = this.findRouting(routerData, routerStrings, intent)
            if (module?.module) {
                return module;
            } else if (routerData.childRouters && routerData.childRouters.length > 0) {
                for (const child of routerData.childRouters) {
                    const routerAtomic = new SimAtomic(child);
                    const rootRouterData = routerAtomic.getConfig<RouterConfig>(RouterMetadataKey)!;
                    const rootRouter = routerAtomic.value!;
                    const executeModule = this.getExecuteModule(rootRouterData, intent, parentRouters)
                    if (rootRouter && executeModule) {
                        return executeModule
                    }
                }
            }
        }
    }

    private isRootUrl(routerData: RouterConfig, parentRoots: string[], url: string): boolean {
        return url.startsWith(parentRoots.join('') + (routerData.path || ''))
    }

    private findRouting(routerData: RouterConfig, parentRoots: string[], intent: Intent): RouterModule | undefined {
        const urlRoot = parentRoots.join('') + routerData.path
        const regex = new RegExp('^' + urlRoot, 'i')
        // path = path.replace(regex, '')
        for (const it of Object.keys(routerData.childs).filter(it => !it.startsWith('_'))) {
            let pathnameData = intent.getPathnameData(urlRoot + it);
            if (pathnameData) {
                const rm = new RouterModule(routerData, routerData.childs[it]);
                rm.pathData = pathnameData;
                return rm;
            }
        }
    }
}
