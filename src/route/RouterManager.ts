import { Intent } from '../intent/Intent';
import { ConstructorType } from '../types/Types';
import { RouterModule } from './RouterModule';
import { Route, RouterConfig, RouterMetadataKey } from '../decorators/route/Router';
import { SimAtomic } from '../simstance/SimAtomic';
import { SimstanceManager } from '../simstance/SimstanceManager';
import {getOnRoute, onRoutes} from '../decorators/route/OnRoute';

export class RouterManager {
    public activeRouterModule?: RouterModule;
    // public subject = new Set<OnActiveRoute>();

    constructor(private simstanceManager: SimstanceManager, private rootRouter: ConstructorType<any>) {
    }

    // public addActiveRouterCallBack(callBackObj: OnActiveRoute) {
    //     this.subject.add(callBackObj);
    // }

    public routingMap(prefix: string = '', router = this.rootRouter): {[key: string]: string | any} {
        const map = {} as {[key: string]: string | any};
        const routerAtomic = new SimAtomic(router, this.simstanceManager);
        const routerData = routerAtomic.getConfig<RouterConfig>(RouterMetadataKey);
        if (routerData) {
            const currentPrefix = prefix + routerData.path;
            if (routerData.route) {
                Object.entries(routerData.route).forEach(([key, value]) => {
                    map[currentPrefix + key] = value;
                });
            }

            routerData.routers?.forEach(it => {
                Object.assign(map, this.routingMap(currentPrefix, it));
            })
        }
        return map;
    }

    public async routing(intent: Intent): Promise<RouterModule|undefined> {
        const routers: any[] = [];
        const routerAtomic = new SimAtomic(this.rootRouter, this.simstanceManager);
        // const rootRouterData = routerAtomic.getConfig<RouterConfig>(RouterMetadataKey)!;
        const rootRouter = routerAtomic.value!;
        const executeModule = this.getExecuteModule(routerAtomic, intent, routers);
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
            this.activeRouterModule = executeModule;

            const otherStorage = new Map<ConstructorType<any>, any>();
            otherStorage.set(Intent, intent);
            otherStorage.set(RouterModule, executeModule);
            for (const [key, value] of Array.from(onRoutes)) {
                try {
                    // const sim = this.simstanceManager.getOrNewSim<any>(key);
                    const sim = this.simstanceManager.findFirstSim({type: key});
                    for (const v of value) {
                        const onRouteConfig = getOnRoute(key, v);
                        let r;
                        if (!onRouteConfig?.isActivateMe) {
                            r = sim?.value[v]?.(...this.simstanceManager.getParameterSim({target: sim?.value, targetKey: v}, otherStorage));
                        } else if (this.activeRouterModule?.routerChains?.some((it: SimAtomic) => (it.value as any)?.hasActivate?.(sim?.value))) {
                            r = sim?.value[v]?.(...this.simstanceManager.getParameterSim({target: sim?.value, targetKey: v}, otherStorage));
                        }
                        if (r instanceof Promise) {
                            await r
                        }
                        // if (r instanceof Promise) {
                        //     this.activeRouterModule.onRouteDatas.push({simAtomic: sim, onRouteData: await r});
                        // } else {
                        //     this.activeRouterModule.onRouteDatas.push({simAtomic: sim, onRouteData: r});
                        // }
                    }
                } catch (error) {
                }
            }
            // for (const it of Array.from(this.subject)) {
            //     await it.onActiveRoute(this.activeRouterModule!);
            // }
            // console.log('routermanager--> return', '1')
            return this.activeRouterModule;
        } else {
            if (routers.length && routers.length > 0) {
                for (let i = 0; i < routers.length; i++) {
                    const current = routers[i];
                    const next = routers[i + 1];
                    const value = current.value! as any;
                    await value?.canActivate?.(intent, next?.value ?? null);
                }

                // const lastRouter = routers.reduce?.((a, b) => {
                //     const value = a.value! as any;
                //     // console.log('routing-null->', b, b.value)
                //     value?.canActivate?.(intent, b.value);
                //     return b;
                // });
                // lastRouter.value?.canActivate?.(intent, null)
            }
            // console.log('routermanager--> return', '2')
            const routerModule = new RouterModule(this.simstanceManager, rootRouter, undefined, routers);
            this.activeRouterModule = routerModule;
            return rootRouter;
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

                // child routers 부터 찾고.
                if (routerConfig.routers && routerConfig.routers.length > 0) {
                    for (const child of routerConfig.routers) {
                        const routerAtomic = new SimAtomic(child, this.simstanceManager);
                        // const rootRouterData = routerAtomic.getConfig<RouterConfig>(RouterMetadataKey)!;
                        const router = routerAtomic.value!;
                        // console.log('---------------', rootRouter)
                        const executeModule = this.getExecuteModule(routerAtomic, intent, parentRouters)
                        if (router && executeModule) {
                            return executeModule
                        }
                    }
                }

                // 그다음 내꺼 찾는다.
                const module = this.findRouting(router, routerConfig, routerStrings, intent)
                if (module?.module) {
                    module.intent = intent;
                    return module;
                }
            }
        }
    }

    private isRootUrl(path: string, parentRoots: string[], url: string): boolean {
        return url.startsWith(parentRoots.join('') + (path || ''))
    }

    private findRouting(router: SimAtomic, routerData: RouterConfig, parentRoots: string[], intent: Intent): RouterModule | undefined {
        const urlRoot = parentRoots.join('') + routerData.path
        // const regex = new RegExp('^' + urlRoot, 'i')
        // path = path.replace(regex, '')
        if (routerData.route) {
            for (const it of Object.keys(routerData.route).filter(it => !it.startsWith('_'))) {
                const pathnameData = intent.getPathnameData(urlRoot + it);
                if (pathnameData) {
                    // const routeElement = routerData.route[it];
                    const {child, data, propertyKeys} = this.findRouteProperty(routerData.route, it);
                    const rm = new RouterModule(this.simstanceManager, router, child);
                    rm.data = data;
                    rm.pathData = pathnameData;
                    rm.propertyKeys = propertyKeys;
                    return rm;
                }
            }
        }
    }

    private findRouteProperty(route: Route, propertyName: string): { child?: ConstructorType<any>, data?: any, propertyKeys?: (string|symbol)[] } {
        let child: ConstructorType<any>|undefined;
        let data: any;
        let propertyKeys: undefined | (string|symbol)[];
        const routeElement = route[propertyName];
        // console.log('-->', Array.isArray(routeElement))
        if (typeof routeElement === 'function') {
            child = routeElement;
        } else if (typeof routeElement === 'string') {
            // console.log('-----', routeElement)
            // if (routeElement.startsWith('redirect:')) {
            //     this.simstanceManager.getOrNewSim(Navigation)?.go(routeElement)
            //     return this.findRouteProperty(route, routeElement)
            // } else {
            // }
            return this.findRouteProperty(route, routeElement)
        } else if (Array.isArray(routeElement)) {
            child = routeElement?.[0];
            data = routeElement?.[1];
        } else if (typeof routeElement === 'object' && 'target' in routeElement && 'propertyKeys' in routeElement) { // RouteTargetMethod
            child = routeElement.target;
            propertyKeys = routeElement.propertyKeys as (string|symbol)[];
        }
        return {
            child,
            data,
            propertyKeys
        }
    }
}
