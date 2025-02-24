/* eslint-disable @typescript-eslint/no-explicit-any */
function getAllMethods<T>(instance: T, cls: {new(p:any): T}) {
    return Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).filter(
        (name) => {
            const method = (instance as any)[name];
            return !(!(method instanceof Function) || method === cls);
        }
    );
}

export function bindClassMethods<T>(instance: T, cls: {new(p:any): T}) {
    getAllMethods(instance, cls).forEach((name) => {
       (instance as any)[name] = (instance as any)[name].bind(instance);
    });
}