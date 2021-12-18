import { Intent } from '../intent/Intent';
import { ConstructorType } from '../types/Types';
import { RouterModule } from './RouterModule';
import { Route, RouterConfig, RouterMetadataKey } from '../decorators/SimDecorator';
import { SimAtomic } from '../simstance/SimAtomic';
import { OnActiveRoute } from '../route/OnActiveRoute';
import { SimstanceManager } from '../simstance/SimstanceManager';

export class RouterManager {
    public activeRouterModule?: RouterModule;
    public subject = new Set<OnActiveRoute>();

    constructor(private simstanceManager: SimstanceManager, private rootRouter: ConstructorType<any>) {
    }

    public addActiveRouterCallBack(callBackObj: OnActiveRoute) {
        this.subject.add(callBackObj);
    }

    public async routing(intent: Intent) {
        const routers: any[] = [];
        const routerAtomic = new SimAtomic(this.rootRouter, this.simstanceManager);
        const rootRouterData = routerAtomic.getConfig<RouterConfig>(RouterMetadataKey)!;
        const rootRouter = routerAtomic.value!;
        const executeModule = this.getExecuteModule(routerAtomic, intent, routers);
        const date = new Date().getTime();
        if (executeModule?.router) {
            executeModule.routerChains = routers;
            if (executeModule.routerChains?.length && executeModule.routerChains?.length > 0) {
                for (let i = 0; i < executeModule.routerChains.length; i++) {
                    const current = executeModule.routerChains[i];
                    const next = executeModule.routerChains[i+1];
                    const value = current.value! as any;
                    if (next) {
                        await value?.canActivate?.(intent, next?.value ?? null);
                    }
                }
                // executeModule.routerChains?.reduce?.((a, b) => {
                //     const value = a.value! as any;
                //     // console.log('routing-->', b, b.value)
                //     value?.canActivate?.(intent, b.value);
                //     return b;
                // });
            }
            this.activeRouterModule = executeModule
            // 페이지 찾지못했을시.
            if (!executeModule?.module) {
                const routerChain = executeModule.routerChains[executeModule.routerChains.length - 1] as any;
                await routerChain?.value?.canActivate?.(intent, executeModule.getModuleInstance());
            } else { // 페이지 찾았을시
                await (executeModule.router?.value! as any)?.canActivate?.(intent, executeModule.getModuleInstance());
            }
            // console.log('activeRouterModule--->', executeModule)
            this.activeRouterModule = executeModule;
            this.subject.forEach(it => it.onActiveRoute(this.activeRouterModule!))
            return this.activeRouterModule;
        } else {
            if (routers.length && routers.length > 0) {
                for (let i = 0; i < routers.length; i++) {
                    const current = routers[i];
                    const next = routers[i+1];
                    const value = current.value! as any;
                    // if (next) {
                        await value?.canActivate?.(intent, next?.value ?? null);
                    // }
                }

                // const lastRouter = routers.reduce?.((a, b) => {
                //     const value = a.value! as any;
                //     // console.log('routing-null->', b, b.value)
                //     value?.canActivate?.(intent, b.value);
                //     return b;
                // });
                // lastRouter.value?.canActivate?.(intent, null)
            }
            return this.activeRouterModule = new RouterModule(this.simstanceManager, rootRouter, undefined, routers);
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
                    module.intent = intent;
                    return module;
                } else if (routerConfig.routers && routerConfig.routers.length > 0) {
                    for (const child of routerConfig.routers) {
                        const routerAtomic = new SimAtomic(child, this.simstanceManager);
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
                const rm = new RouterModule(this.simstanceManager, router, child);
                rm.data = data;
                rm.pathData = pathnameData;
                return rm;
            }
        }
    }

    private findRouteProperty(route: Route, propertyName: string): { child?: ConstructorType<any>, data?: any } {
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
