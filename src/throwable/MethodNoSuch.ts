import {SimError} from './SimError';

export class MethodNoSuch extends SimError {
    constructor(message?: string, name?: string, public propertyKeys?: symbol | string, stack?: string) {
        super(message, name, stack);
    }
}
