import {Intent} from '../intent/Intent';
import {ConstructorType} from '../types/Types';
import {RouterModule} from './RouterModule';
import { getRouter, getSim, Route, RouteProperty, RouterConfig, RouterMetadataKey } from '../decorators/SimDecorator';
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
        const date = new Date().getTime();
        if (executeModule?.router) {
            executeModule.routerChains = routers;
            if (executeModule.routerChains?.length && executeModule.routerChains?.length > 0) {
                executeModule.routerChains?.reduce?.((a, b) => {
                    const value = a.value! as any;
                    // console.log('routing-->', b, b.value)
                    value?.canActivate?.(intent, b.value);
                    return b;
                });
            }
            this.activeRouterModule = executeModule
            // 페이지 찾지못했을시.
            if (!executeModule?.module) {
                const routerChain = executeModule.routerChains[executeModule.routerChains.length - 1] as any;
                routerChain?.value?.canActivate?.(intent, executeModule.getModuleInstance());
            } else { // 페이지 찾았을시
                (executeModule.router?.value! as any)?.canActivate?.(intent, executeModule.getModuleInstance());
            }
            // console.log('activeRouterModule--->', executeModule)
           return this.activeRouterModule = executeModule;
        } else {
            if (routers.length && routers.length > 0) {
                const lastRouter = routers.reduce?.((a, b) => {
                    const value = a.value! as any;
                    // console.log('routing-null->', b, b.value)
                    value?.canActivate?.(intent, b.value);
                    return b;
                });
                lastRouter.value?.canActivate?.(intent, null)
            }
            return this.activeRouterModule = new RouterModule(rootRouter, undefined, routers);
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
                // const routeElement = routerData.route[it];
                const {child, data} = this.findRouteProperty(routerData.route, it);
                const rm = new RouterModule(router, child);
                rm.data = data;
                rm.pathData = pathnameData;
                return rm;
            }
        }
    }

    private findRouteProperty(route: Route, propertyName: string): {child?: ConstructorType<any>, data?: any} {
        let child: ConstructorType<any>;
        let data: any;
        const routeElement = route[propertyName];
        if (typeof routeElement === 'function') {
            child = routeElement;
        } else if (typeof routeElement === 'string') {
            return this.findRouteProperty(route, routeElement)
        } else {
            child = routeElement[0];
            data = routeElement[1];
        }
        return {
            child,
            data
        }
    }
}
