SIMPLE-BOOT-CORE
===

## Sim LifeCycle
OnSimCreate
* onSimCreate: Object create 

```typescript
const option = new SimOption([GlobalAdvice]);
const simpleApplication = new SimpleApplication(AppRouter, option);
simpleApplication.run();
const intent = new Intent('/b/asd/vv');
simpleApplication.routing<SimAtomic<any>, any>(intent).then(it => {
    console.log('--->', it.pathData, it.routerChains);
    let moduleInstance = it.getModuleInstance<User>();
    console.log('-22->', moduleInstance);
    moduleInstance?.print();
    console.log('------->' , simpleApplication.routerManager.activeRouterModule)
});
```


```typescript
@Sim()
@Router({
    route: {
        '': '/',
        '/': [A, {a: 123}],
        '/b': B,
        '/b/{aa}/vv': [B, {b:'zzzzz'}]
    },
    path: '',
    routers: [UserRouter]
})
export class AppRouter implements RouterAction {


    constructor() {
    }


    canActivate(url: Intent, module: any): void {
        console.log('AppRouter canActivate->>>>>', url, module)
    }
}
```
# router
- RouterAction
  - canActivate(url: Intent, module: any): void

```typescript
@Sim({scheme: 'A'})
export class A {
    constructor() {
        console.log('--->aA')
    }

    print(){
        console.log('print')
    }

    gogo(intent: Intent) {
        console.log('gogogo', intent);
    }
}


```

# intent subscribe
- IntentSubscribe
  - intentSubscribe(intent: Intent): void;
```typescript
@Sim()
export class B {
    constructor(private a: A, private routerManager: RouterManager, private simstanceManager: SimstanceManager) {
    }

    print() {
        this.a.print();
        console.log('bbb print', this.routerManager.activeRouterModule.pathData.aa)
    }

    intentSubscribe(intent: Intent) {
        //receive    
    }
    
    err() {
        throw new UserNotFound('good');
    }
}

```
