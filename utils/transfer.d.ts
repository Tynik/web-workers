import { TaskFunction } from '../types';
export declare enum DenormalizedObjectType {
    FUNCTION = "f"
}
export declare const CLONEABLE_OBJECTS: (DateConstructor | RegExpConstructor | {
    new (blobParts?: BlobPart[], options?: BlobPropertyBag): Blob;
    prototype: Blob;
} | {
    new (fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File;
    prototype: File;
} | {
    new (): FileList;
    prototype: FileList;
})[];
export declare const ifCloneableObject: (obj: any) => boolean;
export declare const denormalizePostMessageData: (data: any) => any;
export declare const normalizePostMessageData: (args: any[], normalizeFuncHandler: (obj: string) => TaskFunction) => any;
