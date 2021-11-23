export default class Worker {
    constructor();
    onmessage: any;
    onmessageerror: any;
    postMessage(): void;
    terminate(): void;
}
