import {Module} from "../module/Module";
import {IntentEvent} from "../intent/IntentEvent";
import {ConstructorType} from "../types/Types";
import {SimstanceManager} from "../simstance/SimstanceManager";
import {SimGlobal} from "../global/SimGlobal";
import {Intent} from "../intent/Intent";
import {RouterModule} from "./RouterModule";

export class Router implements IntentEvent {
    [name: string]: ConstructorType<Module> | any;
    private _simstanceManager: SimstanceManager;
    constructor(public path: string = '', public childs: ConstructorType<Router>[] = []) {
        this._simstanceManager = SimGlobal().application?.simstanceManager!;
    }
    publish(intent: Intent): void {
        SimGlobal().application?.publishIntent(intent);
    }

    subscribe(intent: Intent): void {
    }

    getExecuteModule(intent: Intent, parentRouters: Router[]): RouterModule | undefined {
        const path = intent.pathname;
        const routerStrings = parentRouters.slice(1).map(it => it.path || '')
        const isRoot = this.isRootUrl(routerStrings, path)
        if (isRoot) {
            parentRouters.push(this);
            const module = this.routing(routerStrings, path)
            if (module?.module) {
                return module;
            } else {
                for (const child of this.childs) {
                    const route = this._simstanceManager.getOrNewSim(child)
                    const executeModule = route?.getExecuteModule(intent, parentRouters)
                    if (route && executeModule) {
                        return executeModule
                    }
                }
            }
        }
    }

    public isRootUrl(parentRoots: string[], url: string): boolean {
        return url.startsWith(parentRoots.join('') + (this.path || ''))
    }

    // my field find
    public routing(parentRoots: string[], path: string): RouterModule | undefined {
        const urlRoot = parentRoots.join('') + this.path
        const regex = new RegExp('^' + urlRoot, 'i')
        path = path.replace(regex, '')
        const fieldModule = (this[path] as ConstructorType<Module>)
        if (fieldModule) {
            return new RouterModule(this, fieldModule)
        }
    }

    public async canActivate(url: Intent, module: RouterModule): Promise<ConstructorType<Module> | undefined> {
        return module.module;
    }

    public notFound(url: Intent): ConstructorType<Module> | undefined {
        return undefined;
    }
}
