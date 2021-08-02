import 'reflect-metadata'
import {SimstanceManager} from '../simstance/SimstanceManager';
import {Intent} from '../intent/Intent';
import {ConstructorType} from '../types/Types';
import {RouterModule} from './RouterModule';
import { getRouter, getSim, RouterConfig, RouterMetadataKey } from '../decorators/SimDecorator';
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
        // const routers: RouterConfig[] = [];
        const routers: any[] = [];
        const routerAtomic = new SimAtomic(this.rootRouter);
        const rootRouterData = routerAtomic.getConfig<RouterConfig>(RouterMetadataKey)!;
        const rootRouter = routerAtomic.value!;
        const executeModule = this.getExecuteModule(rootRouter, intent, routers);
        // console.log('rootRouter->', this.rootRouter, rootRouter, executeModule)
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
            if (executeModule.router.canActivat) {
                executeModule.module = (await executeModule.router.canActivate(intent, executeModule)) ?? executeModule.module;
            }
            // eslint-disable-next-line no-return-assign
            return this.activeRouterModule = executeModule;
        } else {
            return undefined;
        }
    }

    private getExecuteModule(router: object, intent: Intent, parentRouters: object[]): RouterModule | undefined {
        const path = intent.pathname;
        const routerStrings = parentRouters.slice(1).map(it => getRouter(it)?.path || '');
        const routerConfig = getRouter(router)!
        const isRoot = this.isRootUrl(routerConfig.path, routerStrings, path)
        if (isRoot) {
            parentRouters.push(router);
            const module = this.findRouting(router, routerConfig, routerStrings, intent)
            if (module?.module) {
                return module;
            } else if (routerConfig.childRouters && routerConfig.childRouters.length > 0) {
                for (const child of routerConfig.childRouters) {
                    const routerAtomic = new SimAtomic(child);
                    const rootRouterData = routerAtomic.getConfig<RouterConfig>(RouterMetadataKey)!;
                    const rootRouter = routerAtomic.value!;
                    // console.log('---------------', rootRouter)
                    const executeModule = this.getExecuteModule(rootRouter, intent, parentRouters)
                    if (rootRouter && executeModule) {
                        return executeModule
                    }
                }
            }
        }
    }

    private isRootUrl(path: string, parentRoots: string[], url: string): boolean {
        return url.startsWith(parentRoots.join('') + (path || ''))
    }

    private findRouting(router: object, routerData: RouterConfig, parentRoots: string[], intent: Intent): RouterModule | undefined {
        const urlRoot = parentRoots.join('') + routerData.path
        const regex = new RegExp('^' + urlRoot, 'i')
        // path = path.replace(regex, '')
        for (const it of Object.keys(routerData.childs).filter(it => !it.startsWith('_'))) {
            const pathnameData = intent.getPathnameData(urlRoot + it);
            if (pathnameData) {
                const rm = new RouterModule(router, routerData.childs[it]);
                rm.pathData = pathnameData;
                return rm;
            }
        }
    }
}
