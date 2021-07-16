import {CustomRouter} from "../CustomRouter";
import {User} from "./User";
import {UserDetaile} from "./UserDetaile";
import {Sim} from "simple-boot-core/decorators/SimDecorator";

@Sim()
export class UserRouter extends CustomRouter {
    '' = User
    '/' = User
    '/:no' = User
    '/:no/detaile' = UserDetaile

    constructor() {
        super('/users');
    }
}
