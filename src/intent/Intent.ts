export enum PublishType {
    DATA_PARAMETERS = 'DATA_PARAMETERS',
    INLINE_DATA_PARAMETERS = 'INLINE_DATA_PARAMETERS',
}
/* uri struct
    uri example: mymodule://asd/asd/b?a=545&aa=33&wow=wow
    uri example: ://asd/asd/b?a=545&aa=33&wow=wow
    uri example: /asd/asd/b?a=545&aa=33&wow=wow
    <스킴>://<사용자이름>:<비밀번호>@<호스트>:<포트>/<경로>?<질의>#<프레그먼트>
*/
export class Intent<T = any, E = any> {
    public publishType?: PublishType;
    public sessionData = new Map<string, any>();
    constructor(public uri: string, public data?: T, public event?: E) {
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

    get queryParams(): { [key:string]: string } {
        const param = {} as { [key:string]: string };
        this.query.split('&')?.forEach(it => {
            const a = it.split('=')
            param[a[0]] = a[1];
        })
        return param;
    }

    get queryParamsAfterDecodeURI(): { [key:string]: string } {
        const params = this.queryParams;
        for (const key in params) {
            if (params.hasOwnProperty(key)) {
                params[key] = decodeURIComponent(params[key]);
            }
        }
        return params;
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
            // ex) {serialNo:[0-9]+} or {no}  ..
            const execResult = /^\{(.+)\}$/g.exec(it);
            if (!execResult) {
                if (it !== urlit) {
                    return;
                }
                continue;
            }
            // regex check
            const [name, regex] = execResult[1].split(':'); // group1
            if (regex && !new RegExp(regex).test(urlit)) {
                return;
            }
            data[name] = urlit;
        }
        return data;
    }
}
