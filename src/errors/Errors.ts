export class NotFoundError extends Error {
    constructor (element:string) {
        super(`This element was not found : ${element}`);
    }
}
