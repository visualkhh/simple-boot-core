SIMPLE-BOOT-CORE
===

## Sim LifeCycle
* onCreate: Object create 

```typescript
const option = new CustomSimOption([GlobalAdvice]);
const simpleApplication = new SimpleApplication(AppRouter, option);
simpleApplication.run();
const url = '/users/d51515dd';
simpleApplication.routing<SimAtomic<any>, any>(new Intent(url)).then(it => {
    console.log('--->', it.pathData);
    let moduleInstance = it.getModuleInstance<User>();
    moduleInstance.print();
    console.log('-22->', moduleInstance);
});

```


```typescript

import { A } from './A';
import { B } from './B';
import { Router, RouterConfig, Sim, SimConfig } from 'simple-boot-core/decorators/SimDecorator';
import { Intent } from 'simple-boot-core/intent/Intent';
import { ConstructorType } from 'simple-boot-core/types/Types';
import { UserRouter } from './users/UserRouter';

@Sim()
@Router({
    route: {
        '': A,
        '/': A,
        '/b': B,
        '/b/:aa/vv': B
    },
    path: '',
    routers: [UserRouter]
})
export class AppRouter {


    constructor() {
    }

    notFound(url: Intent): ConstructorType<Object> | undefined {
        console.log('notfound--->');
        return undefined
    }
}



```

```typescript
import {Sim} from "simple-boot-core/decorators/SimDecorator";
import {Intent} from "simple-boot-core/intent/Intent";
import {CustomModule} from "./CustomModule";

@Sim({scheme: 'A'})
export class A extends CustomModule {

    constructor() {
        super();
        console.log('--->aA')
    }

    print(){
        console.log('print')
    }

    gogo(intent: Intent) {
        console.log('gogogo', intent);
    }

}
import {Sim} from "simple-boot-core/decorators/SimDecorator";
import {A} from "./A";
import {UserNotFound} from "./exceptions/UserNotFound";
import {Intent} from "simple-boot-core/intent/Intent";
import {CustomSimOption} from "./CustomSimOption";
import {CustomModule} from "./CustomModule";
import {RouterManager} from "simple-boot-core/route/RouterManager";
import {SimstanceManager} from "simple-boot-core/simstance/SimstanceManager";

```

```typescript
@Sim()
export class B extends CustomModule {


    constructor(private a: A, private option: CustomSimOption, private routerManager: RouterManager, private simstanceManager: SimstanceManager) {
        super();
    }

    print() {
        this.a.print();
        console.log('bbb print', this.routerManager.activeRouterModule.pathData.aa)
    }

    err() {
        // this.publish(new Intent('A://gogo?a=55', 'ddddddddddd'));
        // this.publish(new Intent('A://gogo?bb=44&ff=44', '444'));
        // this.publish(new Intent('A://gogo?gg=55&sadfsdf=444', '55'));
        throw new UserNotFound('good');
    }

}
```
