import { FuncId, TaskFunction, TaskFunctionsCache } from '../types';
export declare const isFunction: (obj: any) => boolean;
export declare const isGeneratorFunc: (func: TaskFunction) => boolean;
export declare const createGeneratorFuncFromStr: (args: string, funcCode: string) => GeneratorFunction;
export declare const generateTaskFuncId: (funcCode: string) => FuncId;
export declare const getFuncArgsFromStr: (funcCode: string) => {
    args: string;
    isGenerator: boolean;
};
export declare const getFuncBodyFromStr: (funcCode: string) => string;
export declare type CreateFuncFromStrOptions = {
    cache?: TaskFunctionsCache;
};
export declare const createFuncFromStr: (funcCode: string, { cache }?: CreateFuncFromStrOptions) => TaskFunction;
