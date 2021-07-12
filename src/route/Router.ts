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
    constructor(public _path: string = '', public _childs: ConstructorType<Router>[] = []) {
        this._simstanceManager = SimGlobal().application?.simstanceManager!;
    }
    publish(intent: Intent): void {
        SimGlobal().application?.publishIntent(intent);
    }

    subscribe(intent: Intent): void {
    }

    getExecuteModule(intent: Intent, parentRouters: Router[]): RouterModule | undefined {
        const path = intent.pathname;
        const routerStrings = parentRouters.slice(1).map(it => it._path || '')
        const isRoot = this.isRootUrl(routerStrings, path)
        if (isRoot) {
            parentRouters.push(this);
            const module = this.routing(routerStrings, intent)
            if (module?.module) {
                return module;
            } else {
                for (const child of this._childs) {
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
        return url.startsWith(parentRoots.join('') + (this._path || ''))
    }

    // my field find
    public routing(parentRoots: string[], intent: Intent): RouterModule | undefined {
        const urlRoot = parentRoots.join('') + this._path
        const regex = new RegExp('^' + urlRoot, 'i')
        // path = path.replace(regex, '')
        for (const it of Object.keys(this).filter(it => !it.startsWith('_'))) {
            let pathnameData = intent.getPathnameData(it);
            if (pathnameData) {
                const rm = new RouterModule(this, this[it]);
                rm.pathData = pathnameData;
                return rm;
            }
        }
    }

    public async canActivate(url: Intent, module: RouterModule): Promise<ConstructorType<Module> | undefined> {
        return module.module;
    }

    public notFound(url: Intent): ConstructorType<Module> | undefined {
        return undefined;
    }
}
