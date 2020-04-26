import { isPrimitive } from './is_primitive';

export namespace serialization {
    enum AbstractEnum {}  // Trick to get "typeof enum"

    type PropertyName = string;
    type ClassInjectionMap = Map<PropertyName, PropertyInjector>;
    type PropertyInjector = (source: object, target: object, propertyName: string) => void;
    type Constructor<T extends {} = {}> = new (...args: any[]) => T;
    type EnumType = typeof AbstractEnum;
    type MapFunction = (src: any) => any;

    /**
     * Special Property type marker.
     * Use it with @PropertyType() property decorator to pass
     * source value "as is".
     */
    export class AsIs extends Object {
    }

    export function ExtractArray(elementType: Constructor) {
        return (target: any, prop: string) => {
            getInjectionMap(target.constructor).set(prop, getTypedArrayPropertyInjector(elementType));
        }
    }

    export function ExtractEnum(type: EnumType) {
        return (target: any, prop: string) => {
            getInjectionMap(target.constructor).set(prop, getEnumPropertyInjector(type));
        }
    }

    export function ExtractType(type: Constructor) {
        return (target: any, prop: string) => {
            getInjectionMap(target.constructor).set(prop, getPropertyTypeInjector(type));
        }
    }

    function getInjectionMap(type: Constructor) {
        let injectionMap = classInjection.get(type);
        if (!injectionMap) {
            injectionMap = new Map<PropertyName, PropertyInjector>();
            classInjection.set(type, injectionMap);
        }
        return injectionMap;
    }


    /**
     * Classes metadata store
     */
    const classInjection = new Map<Constructor, ClassInjectionMap>();

    const stringMapper = (src: any) => src != null ? src.toString() : '';
    const booleanMapper = (src: any) => src != null && !(src == 'false' || src == '' || src == '0');
    const numberMapper = (src: any) => {
        const value = Number(src);
        return isNaN(value) ? undefined : value;
    };
    const dateMapper = (src: any) => {
        const value = new Date(src);
        return isNaN(value.getTime()) ? undefined : value;
    };
    const asisMapper = (src: any) => src;

    const primitiveTypeMapper = new Map<Constructor | string, MapFunction>([
        [String, stringMapper],
        [Number, numberMapper],
        [Boolean, booleanMapper],
        [Date, dateMapper],
        [AsIs, asisMapper],
        ['string', stringMapper],
        ['number', numberMapper],
        ['boolean', booleanMapper]
    ]);

    function untypedArrayMapper(source: any[], target: any[]): any {
        if (Array.isArray(source))
            return source;
        // Implement simple element type assumption?
    }

    function getPropertyTypeInjector(type: Constructor) {
        // TODO: cache here
        return (source: object, target: object, propertyName: string) =>
            typedPropertyInjector(source, target, propertyName, type);
    }

    function getEnumPropertyInjector(type: EnumType) {
        // TODO: cache here
        return (source: object, target: object, propertyName: string) =>
            enumPropertyInjector(source, target, propertyName, type);
    }

    function getTypedArrayPropertyInjector(type: Constructor) {
        // TODO: cache here
        return (source: object, target: object, propertyName: string) =>
            typedArrayPropertyInjector(source, target, propertyName, type);
    }

    function typedPropertyInjector(source: object, target: object, prop: string, type: Constructor) {
        if (!isPrimitive(source) && prop in source && !Array.isArray(source[prop])) {
            const mapper = primitiveTypeMapper.get(type);
            const value = mapper
                ? mapper(source[prop])
                : extract(target[prop] || new type(), source[prop]);

            // Nullable properties are not supported yet.
            // On the other hand, nullable property could be from the very beginning
            // and in this case there is no issue here, but is object is extracted
            // several times, it will be impossible to set null value again.
            if (value !== undefined)
                target[prop] = value;
        }
    }

    function enumPropertyInjector(source: object, target: object, prop: string, type: EnumType) {
        if (!isPrimitive(source) && prop in source && !Array.isArray(source[prop])) {
            if (source[prop] in type)
                target[prop] = source[prop];
        }
    }

    function typedArrayPropertyInjector(source: object, target: object, prop: string, type: Constructor) {
        const mapper = primitiveTypeMapper.get(type);
        const sourceValue = source[prop];
        if (!isPrimitive(source) && prop in source && Array.isArray(sourceValue)) {
            // Consider filtering undefined values as an option
            mapper
                ? target[prop] = sourceValue.map(mapper).filter(value => value !== undefined)
                : target[prop] = extractArray(type, sourceValue);
        }
    }

    export function extract<T extends object, S extends object>(target: T, source: S): T {
        if (isPrimitive(source))
            return target;

        const constructor = target.constructor as Constructor;
        const staticInjectionMap = classInjection.get(constructor);
        let sourceKeys = Object.keys(source).filter(key => typeof source[key] !== 'function');
        let targetKeys = Object.keys(target).filter(key => typeof target[key] !== 'function');

        if (staticInjectionMap) {
            for (const [prop, injector] of staticInjectionMap) {
                injector(source, target, prop);
            }

            // This might be optimized to single filtering pass
            targetKeys = targetKeys.filter(key => !staticInjectionMap.has(key));
            sourceKeys = sourceKeys.filter(key => !staticInjectionMap.has(key));
        }

        if (targetKeys.length < sourceKeys.length) {
            extractRawProperties(source, target, targetKeys)
        }
        else {
            extractRawProperties(source, target, sourceKeys);
        }

        return target;
    }

    function extractRawProperties(source: object, target: object, properties: string[]) {
        for (const prop of properties) {
            // Detect property types by target property type.
            // If target property is null or undefined it is impossible get its type.
            if (target[prop] == null)
                continue;

            let targetValue: any;

            if (isPrimitive(target[prop])) {
                const mapper = primitiveTypeMapper.get(typeof target[prop]);
                assertMapper(mapper, source[prop], target[prop]);
                targetValue = mapper(source[prop]);
            }
            // Special case for Date
            else if (target[prop] instanceof Date) {
                const mapper = primitiveTypeMapper.get(Date);
                assertMapper(mapper, source[prop], target[prop]);
                targetValue = mapper(source[prop])
            }
            // Special case for Arrays
            else if (Array.isArray(target[prop])) {
                targetValue = untypedArrayMapper(source[prop], target[prop]);
            }
            else {
                targetValue = extract(target[prop], source[prop]);
            }

            if (targetValue != null)
                target[prop] = targetValue;
        }
    }

    function assertMapper(mapper: any, sourceValue: any, targetValue: any): asserts mapper {
        if (!mapper)
            throw Error(`Unable to map primitive value: ${sourceValue} -> ${targetValue}`);
    }

    export function extractArray(targetType: Constructor, source: object[]) {
        return source.map(item => extract(new targetType(), item));
    }
}
