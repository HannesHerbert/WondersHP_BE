import express from 'express';
import User from '../models/user.model.js';
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


// loggt User ein
export async function loginUser(req, res) {
    // Extrahiere den Benutzernamen und das Passwort aus dem Request-Body
    const { username, password } = req.body;

    try {
        // Finde den User anhand des Benutzernamens
        const user = await User.findOne({ where: { username } });

        // Überprüfe, ob der User existiert
        if (!user) {

            console.log('User does not exist');
            
            return res.status(404).json({
                success: false,
                message: 'User does not exist'
            });
        }

        // Vergleiche das eingegebene Passwort mit dem gespeicherten Passwort
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {

            console.log('Invalid password');
            

            return res.status(401).json({
                success: false,
                message: 'Invalid password'
            });
        }

        // Erstelle die Payload für das Token
        const tokenPayload = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        // Generiere das JWT-Token
        const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
            expiresIn: '1h' // Optional: Setze die Ablaufzeit für das Token
        });

        // Erstelle das User-Objekt für die Antwort
        const foundUser = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        console.log('login successfull');
        

        // Sende die Antwort zurück mit User-Informationen und dem Token
        return res.json({ user: foundUser, token: accessToken });

    } catch (error) {
        console.error('Login error:', error);
        // Sende einen Fehlerstatus zurück, falls ein Fehler auftritt
        return res.status(500).json({
            success: false,
            message: 'An error occurred during login'
        });
    }
}


export async function validateUser(req, res) {

    const id = req.tokenPayload.id;

    try {

        const user = await User.findOne({ where: { id } });

        res.send({
            success: true,
            user: user
        })

    } catch (error) {
        console.log(error);

        res.status(error.code).send({
            message: error.message
        })
    }
}

export async function createUser(req, res) {

    // // erstellt einen eMail-Hash um Verifizierungs-Link zu senden
    // const salt = await bcrypt.genSalt(10);
    // body.emailHash = md5(body.email + salt);

    // extrahiert alle fields aus body
    let { username, email, password } = req.body;

    console.log(req.body);

    // // verschlüsselt Passwort / erstellt Passwort-Hash
    password = await bcrypt.hash(password, 10);


    try {
        const newUser = await User.create({ username, email, password });
        res.status(201).json(newUser);

    } catch (error) {
        console.error('Failed to create user', error); // Protokollieren der genauen Fehlermeldung
        res.status(500).json({ message: 'Failed to create user', error: error.message });
    }
};

