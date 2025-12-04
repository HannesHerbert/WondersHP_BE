import { Router } from "express";
import jwt from "jsonwebtoken";
import { createUser, validateUser } from "../controller/user.controller.js";
import { createMember, updateMembers } from "../controller/member.controller.js";
import { convertMedia, getAllImages } from "../controller/media.controller.js";
import { upload } from "../service/upload.service.js";




// Middleware-Funktion zum Validieren von Tokens im Header
export function verifyAdminToken(req, res, next) {

    // Wenn Authorization im Header nicht gesetzt, breche ab und sende Fehler
    if (!req.headers.authorization) return res.status(401).send({ success: false, message: 'Token missing!!!' });

    // Extrahiere Token aus dem authorization Feld im HTTP Request Header
    let token = req.headers.authorization.split(' ')[1];

    // Verifiziere extrahierten Token mittels Signaturpruefung
    jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {

        // Wenn Verifizierung fehlgeschlagen, brich ab und sende Fehler
        if (err) return res.status(401).send({ success: false, message: 'Invalid token' });

        // Alles gut, speichere payload im req-Objekt
        req.tokenPayload = payload;

        // Fahre mit Anfrage fort
        next();
    });
};


const AdminRouter = Router();

// AdminRouter.use(verifyAdminToken);

//USER
AdminRouter.route('/create-user')
    .post(createUser)

AdminRouter.route('/update-members')
    .put(updateMembers)

AdminRouter.route('/validate')
    .post(validateUser)

AdminRouter.route('/create-member')
    .post(createMember)

AdminRouter.route('/upload-media')
    .post(upload.single('file'), convertMedia)

AdminRouter.route('/list-images')
    .get(getAllImages)

// AdminRouter.route('/user/:id')
//     .delete(deleteUserById)     // löscht Userprofile
//     .put(updateUserData)        // editiert Userprofile
//     .get(getUserById)

// // REPORTS
// AdminRouter.route('/reports')
//     .get(getReports)            // fetcht alle Reports

// AdminRouter.route('/report/:id')
//     .delete(deleteReportById)
//     .put(closeReport)

// AdminRouter.route('/reports/amount/:id')
//     .get(getReportAmountOfUser)

// // POSTS
// AdminRouter.route('/posts/amount/:id')
//     .get(getPostAmountOfUser)   // holt die Anzahl der Posts eines Users

// AdminRouter.route('/post/:id')
//     .put(hidePost)

// AdminRouter.route('/posts')
//     .get(getSortedPosts)

// // COMMENTS
// AdminRouter.route('/comment/:id')
//     .put(hideComment)

// // Pfad um key-value-Paar zu allen Dokumenten einer Collection hinzuzufügen
// AdminRouter.route('/updatecollection') // Queries: model, key, value
//     .put(updateCollection)


export default AdminRouter