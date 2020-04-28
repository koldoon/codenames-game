import { isPrimitive } from './is_primitive';

export namespace serialization {
    // ------------------------------------------------------------------------
    // Public Interface
    // ------------------------------------------------------------------------

    /**
     * Special Property type marker.
     * Use it with @ExtractType() property decorator to pass
     * source value "as is".
     */
    export class AsIs extends Object {
    }

    /**
     * Mark class property to define exact type that should be
     * set during extracting (deserialization). Also, this is
     * the only way to define "nullable" properties.
     */
    export function ExtractType(type: Constructor) {
        return (target: any, prop: string) => {
            getInjectionMap(target.constructor).set(prop, getPropertyTypeInjector(type));
        }
    }

    /**
     * Mark array properties elements types. Type will be created during deserialization
     * from constructor. Updating and merging is not supported yet.
     */
    export function ExtractArray(elementType: Constructor) {
        return (target: any, prop: string) => {
            getInjectionMap(target.constructor).set(prop, getTypedArrayPropertyInjector(elementType));
        }
    }

    /**
     * Mark properties with Typescript Enum types. Possible values will be checked
     * during extracting and assigned if value is correct.
     */
    export function ExtractEnum(type: EnumType) {
        return (target: any, prop: string) => {
            getInjectionMap(target.constructor).set(prop, getEnumPropertyInjector(type));
        }
    }

    /**
     * Extract strongly typed structure or a class instance from raw untyped dynamic object.
     * Inspired by as3-vanilla library.
     */
    export function extract<T extends object, S extends object>(target: T, source: S): T {
        if (isPrimitive(source))
            return target;

        const constructor = target.constructor as Constructor;
        const staticInjectionMap = classInjection.get(constructor);
        let keysFilter = (obj: object) => (key: string) => typeof obj[key] !== 'function';

        if (staticInjectionMap) {
            for (const [prop, injector] of staticInjectionMap) {
                injector(source, target, prop);
            }

            keysFilter = (obj: object) => (key: string) => {
                // Extend filter function to skip statically described properties
                return typeof obj[key] !== 'function' && !staticInjectionMap.has(key);
            };
        }

        const sourceKeys = Object.keys(source).filter(keysFilter(source));
        const targetKeys = Object.keys(target).filter(keysFilter(target));

        if (targetKeys.length < sourceKeys.length) {
            extractRawProperties(source, target, targetKeys)
        }
        else {
            extractRawProperties(source, target, sourceKeys);
        }

        return target;
    }

    /**
     * Extract untyped array into strongly typed array.
     */
    export function extractArray(targetType: Constructor, source: object[]) {
        return source.map(item => extract(new targetType(), item));
    }

    // ------------------------------------------------------------------------
    // Internal Implementation
    // ------------------------------------------------------------------------

    enum AbstractEnum {}  // Trick to get "typeof enum"

    type PropertyName = string;
    type Constructor<T extends {} = {}> = new (...args: any[]) => T;
    type PropertyInjector = (source: object, target: object, propertyName: string) => void;
    type ClassInjectionMap = Map<PropertyName, PropertyInjector>;
    type EnumType = typeof AbstractEnum;
    type MapFunction = (src: any) => any;

    // Classes metadata store
    const classInjection = new Map<Constructor, ClassInjectionMap>();

    // Cached property injectors
    const enumInjector = new Map<EnumType, PropertyInjector>();
    const valueInjector = new Map<Constructor, PropertyInjector>();
    const arrayInjector = new Map<Constructor, PropertyInjector>();

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

    function getInjectionMap(type: Constructor) {
        if (classInjection.get(type) == undefined)
            classInjection.set(type, new Map<PropertyName, PropertyInjector>());
        return classInjection.get(type)!;
    }

    function getPropertyTypeInjector(type: Constructor): PropertyInjector {
        if (valueInjector.get(type) == undefined)
            valueInjector.set(type, (source: object, target: object, propertyName: string) => {
                typedPropertyInjector(source, target, propertyName, type);
            });
        return valueInjector.get(type)!;
    }

    function getEnumPropertyInjector(type: EnumType): PropertyInjector {
        if (enumInjector.get(type) == undefined)
            enumInjector.set(type, (source: object, target: object, propertyName: string) => {
                enumPropertyInjector(source, target, propertyName, type);
            });
        return enumInjector.get(type)!;
    }

    function getTypedArrayPropertyInjector(type: Constructor): PropertyInjector {
        if (arrayInjector.get(type) == undefined)
            arrayInjector.set(type, (source: object, target: object, propertyName: string) => {
                typedArrayPropertyInjector(source, target, propertyName, type);
            });
        return arrayInjector.get(type)!;
    }

    function typedPropertyInjector(source: object, target: object, prop: string, type: Constructor) {
        if (isPrimitive(source) || !(prop in source) || Array.isArray(source[prop]))
            return;

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

    function enumPropertyInjector(source: object, target: object, prop: string, type: EnumType) {
        if (isPrimitive(source) || !(prop in source) || Array.isArray(source[prop]))
            return;

        if (source[prop] in type)
            target[prop] = source[prop];
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

    function extractRawProperties(source: object, target: object, properties: string[]) {
        for (const prop of properties) {
            // Detect property types by target property type.
            // If target property is null or undefined it is impossible get its type.
            if (target[prop] == null)
                continue;

            let targetValue: any;

            if (isPrimitive(target[prop])) {
                const mapper = primitiveTypeMapper.get(typeof target[prop])!;
                targetValue = mapper(source[prop]);
            }
            // Special case for Date
            else if (target[prop] instanceof Date) {
                const mapper = primitiveTypeMapper.get(Date)!;
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
}
