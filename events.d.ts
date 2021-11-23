export declare type EventCallback<Result = any> = (result?: Result) => void | boolean;
export declare type Event<Result = any> = {
    id: string;
    callback: EventCallback<Result>;
    once: boolean;
};
export declare type EventsList<List extends string> = Partial<Record<List, Event<any>[]>>;
export interface EventAPI {
    remove: () => void;
}
export declare class Events<Events extends string = any> {
    private list;
    add<Result = any>(name: string, callback: EventCallback<Result>, once?: boolean): EventAPI;
    raise<Result = any>(name: string, result?: Result): void;
    get count(): number;
    getCountCallbacks(name: string): number;
    remove(name: string): void;
    clear(): void;
    private removeById;
}
