import {Sim} from 'simple-boot-core/decorators/SimDecorator';

@Sim()
export class ProjectService {
    calc(a: number, b: number): number {
        return a + b;
    }
}