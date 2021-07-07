SIMPLE-BOOT-CORE
===

```typescript
const option = new CustomSimOption([GlobalAdvice]);
const simpleApplication = new SimpleApplication(AppRouter, option);
simpleApplication.run();
simpleApplication.routing<CustomRouter, CustomModule>(new Intent('/b')).then(it => {
    let moduleInstance = it.getModuleInstance<B>();
    moduleInstance.print();
});
```


```typescript

@Sim()
export class AppRouter extends CustomRouter {
    '' = A;
    '/' = A;
    '/b' = B;
    notFound(url: Intent): ConstructorType<Module> | undefined {
        return super.notFound(url);
    }
}


```

```typescript
@Sim()
export class B extends CustomModule {
    constructor(private a: A, private option: CustomSimOption) {
        super();
    }
    print() {
        this.a.print();
        console.log('bbb print')
    }
    err() {
        this.publish(new Intent('A://gogo?a=55', 'ddddddddddd'));
        this.publish(new Intent('A://gogo?bb=44&ff=44', '444'));
        this.publish(new Intent('A://gogo?gg=55&sadfsdf=444', '55'));
        throw new UserNotFound('good');
    }
}

```
