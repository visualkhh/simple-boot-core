export class SimProxy implements ProxyHandler<any> {
    has(target: any, key: PropertyKey): boolean {
        if (key === 'isProxy') {
            return true
        }
        return key in target
    }



    set(target: any, p: string | symbol, value: any, receiver: any): boolean {
        return false;
    }



}
