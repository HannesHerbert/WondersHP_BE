/** Leitet Fehler aus async-Handlern an den Error-Handler weiter – spart try/catch in jedem Controller. */
export const asyncHandler = (handler) => (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
