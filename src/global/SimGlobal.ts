import {SimpleApplication} from '../SimpleApplication';
import {ConstructorType} from '../types/Types';
declare let global: any;
declare let window: any;

const g = new class {
    _application?: SimpleApplication;
    storage = new Set<ConstructorType<any>>();
    // storage = new Map<ConstructorType<any>, { config?: SimConfig, object?: any }>();

    set application(application: SimpleApplication | undefined) {
        this._application = application;
        // (window as any).application = this._application;
    }

    get application(): SimpleApplication | undefined {
        return this._application;
    }
}()

if (global) {
    global.SimGlobal = g
} else if (window) {
    window.SimGlobal = g
}
export const SimGlobal = () => {
    if (global) {
        return global.SimGlobal;
    } else if (window) {
        return window.SimGlobal;
    } else {
        return g;
    }
}
