export class ValidUtils {
    static isNullOrUndefined(data: any): boolean {
        return data == null || undefined === data;
    }

    static isNotNullUndefined(data: any) {
        return data !== null && data !== undefined;
    }

    static isNull(data: any): boolean {
       return data === null;
    }

    static isUndefined(data: any): boolean {
       return data === undefined;
    }

    static isArray(object_o: any): boolean {
        if (ValidUtils.isNullOrUndefined(object_o)) {
            return false
        } else {
            return Object.prototype.toString.call(object_o).trim() === '[object Array]'
        }
    }

    static isNumber(object_o: any): boolean {
        if (ValidUtils.isNullOrUndefined(object_o)) {
            return false
        } else {
            return Object.prototype.toString.call(object_o).trim() === '[object Number]'
        }
    }

    static isString(object_o: any): boolean {
        if (ValidUtils.isNullOrUndefined(object_o)) {
            return false
        } else {
            return Object.prototype.toString.call(object_o).trim() === '[object String]'
        }
    }

    static isFunction(object_o: any): boolean {
        if (ValidUtils.isNullOrUndefined(object_o)) {
            return false
        } else {
            return Object.prototype.toString.call(object_o).trim() === '[object Function]'
        }
    }

    static isObject(object_o: any): boolean {
        if (ValidUtils.isNullOrUndefined(object_o)) {
            return false
        } else {
            return Object.prototype.toString.call(object_o).trim() === '[object Object]'
        }
    }

    static isMap(object_o: any): boolean {
        if (ValidUtils.isNullOrUndefined(object_o)) {
            return false
        } else {
            return Object.prototype.toString.call(object_o).trim() === '[object Map]'
        }
    }
}
