import {SimpleApplication} from 'simple-boot-core';
import {Router} from 'simple-boot-core/decorators/route/Router';
import {Sim} from 'simple-boot-core/decorators/SimDecorator';

@Sim
class ProjectService {
    sum(x: number, y: number){
        return x + y;
    }
}

@Sim
class User {

    constructor(private projectService: ProjectService) {
    }

    sum(x: number, y: number) {
        return this.projectService.sum(x, y);
    }
}
const app = new SimpleApplication();
app.run();
const sum = app.sim(User).sum(1,3);
console.log(sum)



// @Sim
// @Router({
//     path: '',
//     route: {'/user': User}
// })
// class AppRouter {
// }


// const app = new SimpleApplication(AppRouter);
// app.run();
// app.routing('/user').then(it => {
//     const sum = it.getModuleInstance<User>()?.sum(1, 5);
//     console.log(`sum: ${sum}`);
// })
