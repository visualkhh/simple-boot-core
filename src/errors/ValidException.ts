import {ValidationResult} from '../decorators/validate/Validation';

export class ValidException {
    constructor(public result: ValidationResult[]) {
    }

    toString(): string {
        return this.result ? JSON.stringify(this.result) : 'undefined';
    }

    get message() {
        return this.toString();
    }
}