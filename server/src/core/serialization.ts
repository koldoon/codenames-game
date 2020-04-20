// import { isPrimitive } from './is_primitive';
//
// /**
//  * Special Property type marker.
//  * Use it with @PropertyType() property decorator to pass
//  * source value "as is"
//  */
// export class AsIs extends Object {
// }
//
// export namespace serialization {
//     export type Constructor<T> = new (...args: any[]) => T;
//
//     type PropertySetter<T> = (target: T, prop: string, value: any) => void;
//     type ClassMeta<T> = Map<string, PropertySetter<T>>;
//
//     class AnyClass {}
//
//     // TODO: Revert (invert) properties scanning from target to source and implement this as "assign(source, toObject)" function.
//     // (useful for db filters with nullable properties)
//
//     /**
//      * Similar to Object.assign() method, but also respect typed (annotated) arrays
//      * and undefined (annotated) properties.
//      *
//      * Use @ArrayElementType and @PropertyType annotations to add information
//      * about desired property types.
//      */
//     export function extract<T extends AnyClass>(target: T, source: any): T {
//         if (typeof target === 'function')
//             throw Error(`target must be an instance`);
//
//         if (!source || !target)
//             return source;
//
//         const targetTypeMeta = getTypeMetadata(target.constructor);
//         for (const [prop, setProperty] of targetTypeMeta) {
//             if (!isPrimitive(source) && prop in source)
//                 setProperty(target, prop, source[prop]);
//         }
//
//         for (let prop of Object.keys(target)) {
//             if (targetTypeMeta.get(prop)) {
//                 // nothing
//             }
//             else if (isSimpleType(getValueType(target[prop]))) {
//                 if (!isPrimitive(source) && prop in source && source[prop] !== undefined) {
//                     const targetType = getValueType(target[prop]);
//                     const mappedValue = simpleTypeMapper[targetType](source[prop]);
//                     if (targetType != 'number' || !isNaN(mappedValue))
//                         target[prop] = mappedValue;
//                 }
//             }
//             else if (target[prop]) {
//                 if (Array.isArray(target[prop])) { // unannotated arrays
//                     if (source[prop] !== undefined)
//                         target[prop] = Array.isArray(source[prop]) ? source[prop] : [];
//                 }
//                 else {
//                     extract(target[prop], source[prop]);
//                 }
//             }
//             else {
//                 console.error(`serialization: property skipped due to unknown type -> ${target.constructor.name}.${prop}`);
//             }
//         }
//         return target;
//     }
//
//     /**
//      * Extract Array value using given element type.
//      */
//     export function extractArray<T extends AnyClass>(ElementType: Constructor<T>, source: any[]): T[] {
//         if (!Array.isArray(source))
//             return [];
//         return source.map<T>(item => extract(new ElementType(), item));
//     }
//
//     /**
//      * ArrayElementType annotation handler
//      */
//     export function ArrayElementType<T extends AnyClass>(ElementClass: Constructor<T>): Function {
//         return (target: T, prop: string) => {
//             addPropertySetterFor(target.constructor, prop, getSetterForArray(ElementClass));
//         };
//     }
//
//     /**
//      * PropertyType annotation handler
//      */
//     export function PropertyType<T>(PropertyType: Function): Function {
//         return (target: object, prop: string) => {
//             addPropertySetterFor(target.constructor, prop, getSetterForType(PropertyType));
//         };
//     }
//
//     const metadataRegistry = new Map<Function, ClassMeta<any>>();
//     const simpleTypeMapper = {
//         'string': src => src != null ? src.toString() : '',
//         'number': src => Number(src),
//         'boolean': src => src != null && !(src == 'false' || src == '' || src == '0'),
//         'date': src => new Date(src),
//         'asis': src => src
//     };
//
//     function getSetterForArray<T extends AnyClass>(ElementType: Function): PropertySetter<T> {
//         let valueBuilder = isSimpleType(getTypeName(ElementType))
//             ? src => simpleTypeMapper[getTypeName(ElementType)](src)
//             : src => extract(new (ElementType as Constructor<T>)(), src);
//
//         return (target: T, prop: string, value: any) => {
//             if (value === undefined)
//                 return;
//
//             if (!Array.isArray(value)) {
//                 // property is present, but could not be converted to array
//                 if (target.hasOwnProperty(prop))
//                     target[prop] = undefined;
//                 return;
//             }
//
//             target[prop] = [];
//
//             for (let item of value) {
//                 target[prop].push(valueBuilder(item));
//             }
//         };
//     }
//
//
//     function getSetterForType<T>(PropertyType: Function): PropertySetter<T> {
//         return isSimpleType(getTypeName(PropertyType))
//             ? (target: T, prop: string, value: object) => {
//                 if (value !== undefined)
//                     target[prop] = simpleTypeMapper[getTypeName(PropertyType)](value);
//             }
//             : (target: T, prop: string, value: object) => {
//                 if (value === undefined)
//                     return;
//
//                 if (!target[prop] || target[prop].constructor != PropertyType)
//                     target[prop] = new (PropertyType as Constructor<T>)();
//
//                 extract(target[prop], value);
//             };
//     }
//
//
//     function getValueType(v: any): any {
//         return typeof v === 'object' && v !== null ? getTypeName(v.constructor) : typeof v;
//     }
//
//
//     function getTypeName<T>(Type: Function | string): string {
//         return typeof Type === 'string' ? Type.toLowerCase() : Type.name.toLowerCase();
//     }
//
//
//     function isSimpleType(typeName: string) {
//         return typeName in simpleTypeMapper;
//     }
//
//
//     function addPropertySetterFor<T>(Type: Function, prop: string, setter: PropertySetter<T>) {
//         let classMeta = metadataRegistry.get(Type);
//         if (!classMeta)
//             classMeta = new Map<string, PropertySetter<T>>();
//
//         classMeta.set(prop, setter);
//         metadataRegistry.set(Type, classMeta);
//     }
//
//
//     /**
//      * Since getTypeMetadata() can merge results from all the class inheritance
//      * chain, we cache it's results for speed optimization
//      */
//     const typeMetadataCache = new Map<Function, ClassMeta<any>>();
//
//     function getTypeMetadata<T>(Type: Function): ClassMeta<T> {
//         const cached = typeMetadataCache.get(Type);
//         if (cached)
//             return cached;
//
//         let fullMeta = new Map<string, PropertySetter<T>>();
//         for (let t = Type; t; t = Object.getPrototypeOf(t)) {
//             let meta = metadataRegistry.get(t);
//             if (meta) {
//                 for (let [key, value] of meta) {
//                     fullMeta.set(key, value);
//                 }
//             }
//         }
//
//         if (Type.name != 'Object') // no sense in caching raw objects
//             typeMetadataCache.set(Type, fullMeta);
//
//         return fullMeta;
//     }
// }
