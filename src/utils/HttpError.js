/** Fehler mit HTTP-Status – wird vom zentralen Error-Handler ausgewertet. */
export default class HttpError extends Error {
    constructor(status, message, details) {
        super(message);
        this.status = status;
        this.details = details;
    }

    static badRequest(message, details) { return new HttpError(400, message, details); }
    static unauthorized(message = 'Nicht autorisiert') { return new HttpError(401, message); }
    static notFound(message = 'Nicht gefunden') { return new HttpError(404, message); }
}
