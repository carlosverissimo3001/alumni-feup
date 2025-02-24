export class ResponseError extends Error {
    override name = 'ResponseError' as const;

    constructor(public response: Response, message?: string) {
        super(message);
    }
}