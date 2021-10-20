import 'reflect-metadata'
import {Intent} from '../intent/Intent';
import {ConstructorType} from '../types/Types';
import {RouterModule} from './RouterModule';
import { getRouter, getSim, RouterConfig, RouterMetadataKey } from '../decorators/SimDecorator';
import { SimAtomic } from '../simstance/SimAtomic';

export class RouterManager {
    public activeRouterModule?:RouterModule;
    // public subject = new Subject<Intent>()
    constructor(private rootRouter: ConstructorType<any>) {
    }

    public async routing(intent: Intent) {
        const routers: any[] = [];
        const routerAtomic = new SimAtomic(this.rootRouter);
        const rootRouterData = routerAtomic.getConfig<RouterConfig>(RouterMetadataKey)!;
        const rootRouter = routerAtomic.value!;
        const executeModule = this.getExecuteModule(routerAtomic, intent, routers);
        if (!executeModule) {
            // notfound find
            let notFound;
            for (const route of routers.slice().reverse()) {
                if (route !== rootRouter && route.notFound) {
                    const nf = route.notFound(intent);
                    if (nf) {
                        notFound = nf;
                        break;
                    }
                }
            }
            // notFound = notFound ?? rootRouter?.notFound(intent);
            // eslint-disable-next-line no-return-assign
            return this.activeRouterModule = new RouterModule(rootRouter, notFound, routers);
        }

        if (executeModule.router) {
            executeModule.routerChains = routers;
            // eslint-disable-next-line no-return-assign
            return this.activeRouterModule = executeModule;
        } else {
            return undefined;
        }
    }

    private getExecuteModule(router: SimAtomic, intent: Intent, parentRouters: SimAtomic[]): RouterModule | undefined {
        const path = intent.pathname;
        const routerConfig = router.getConfig<RouterConfig>(RouterMetadataKey);
        if (routerConfig) {
            const routerStrings = parentRouters.slice(1).map(it => it.getConfig<RouterConfig>(RouterMetadataKey)?.path || '');
            const isRoot = this.isRootUrl(routerConfig.path, routerStrings, path)
            if (isRoot) {
                parentRouters.push(router);
                const module = this.findRouting(router, routerConfig, routerStrings, intent)
                if (module?.module) {
                    return module;
                } else if (routerConfig.routers && routerConfig.routers.length > 0) {
                    for (const child of routerConfig.routers) {
                        const routerAtomic = new SimAtomic(child);
                        const rootRouterData = routerAtomic.getConfig<RouterConfig>(RouterMetadataKey)!;
                        const router = routerAtomic.value!;
                        // console.log('---------------', rootRouter)
                        const executeModule = this.getExecuteModule(routerAtomic, intent, parentRouters)
                        if (router && executeModule) {
                            return executeModule
                        }
                    }
                }
            }
        }
    }

    private isRootUrl(path: string, parentRoots: string[], url: string): boolean {
        return url.startsWith(parentRoots.join('') + (path || ''))
    }

    private findRouting(router: SimAtomic, routerData: RouterConfig, parentRoots: string[], intent: Intent): RouterModule | undefined {
        const urlRoot = parentRoots.join('') + routerData.path
        const regex = new RegExp('^' + urlRoot, 'i')
        // path = path.replace(regex, '')
        for (const it of Object.keys(routerData.route).filter(it => !it.startsWith('_'))) {
            const pathnameData = intent.getPathnameData(urlRoot + it);
            if (pathnameData) {
                const rm = new RouterModule(router, routerData.route[it]);
                rm.pathData = pathnameData;
                return rm;
            }
        }
    }
}
