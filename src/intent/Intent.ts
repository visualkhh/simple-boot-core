export class Intent<T = any, E = any> {
    // uri example: mymodule://asd/asd/b?a=545&aa=33&wow=wow
    // uri example: ://asd/asd/b?a=545&aa=33&wow=wow
    // uri example: /asd/asd/b?a=545&aa=33&wow=wow
    // <스킴>://<사용자이름>:<비밀번호>@<호스트>:<포트>/<경로>?<질의>#<프레그먼트>
    public publishOnlyData = false;
    constructor(public uri: string, public data?: T, public event?: E) {
    }

    get publishData(): T | undefined | this {
        return this.publishOnlyData ? this.data : this;
    }

    get scheme() {
        return this.uri.split('://')[0];
    }

    get paths() {
        return (this.pathname.split('/') ?? []);
    }

    get fullPath() {
        const paths = this.uri.split('://')
        return paths[paths.length >= 2 ? 1 : 0] ?? '';
    }

    get pathname() {
        const paths = this.fullPath.split('?');
        return paths[0];
    }

    get query() {
        const paths = this.fullPath.split('?');
        return paths[1] ?? '';
    }

    get queryParams() {
        const param = {} as { [key:string]: string };
        this.query.split('&')?.forEach(it => {
            const a = it.split('=')
            param[a[0]] = a[1];
        })
        return param;
    }

    getPathnameData(urlExpression: string) {
        const urls = this.pathname.split('/');
        const urlExpressions = urlExpression.split('/');
        if (urls.length !== urlExpressions.length) {
            return;
        }
        const data: {[name: string]: string } = {}
        for (let i = 0; i < urlExpressions.length; i++) {
            const it = urlExpressions[i];
            const urlit = urls[i];
            if (!it.startsWith(':')) {
                if (it !== urlit) {
                    return;
                }
                continue;
            }
            data[it.slice(1)] = urlit;
        }
        return data;
    }
}
