import express from 'express';
import AdminRouter from './routes/admin.routes.js';
import LoginRouter from './routes/login.routes.js';
import PublicRouter from './routes/public.route.js'
import { connectToDb, sequelize } from './service/db.service.js';
import cors from 'cors';
import User from './models/user.model.js';
import { cloudinaryInit } from './service/cloudinary.service.js';

// import cors from 'cors';
import dotenv from 'dotenv';


// Lade Umgebungsvariablen (engl. enviroment variables) aus der .env Datei
dotenv.config();

// const express = require('express');
const app = express();

// Middleware fuer das body-Parsing
//!! Erweitere maximale file-size für Bild-Upload (wg Cloudinary)
app.use(express.json({ limit: "50mb" }));

// Middleware fuer CROSS-ORIGIN-REQUEST
app.use(cors({
    origin: process.env.ORIGIN_FE,
    // credentials: true
}));


// --------------------- ROUTES -------------------------



app.use('/admin', AdminRouter);

app.use('/login', LoginRouter);

app.use('/public', PublicRouter);

// app.use('/hcaptcha', HCaptchaRouter);


// ---------------------INITIALISIERUNG--------------------------

const start = async () => {
    try {

        // Initialisiert Cloud-Dienst für File-Upload (Cloudinary)
        cloudinaryInit();

        // Einmalig Verbindung ueber default Connection aufbauen
        // es kann noch ein Callback mitgeliefert werden
        await connectToDb();

        // Starte Server auf dem in der Config hinterlegten Port
        app.listen(process.env.API_PORT, () => console.log(`Server is listening on http://localhost:${process.env.API_PORT}`));

    } catch (error) {
        console.log(error);
    }
};

start();

// ---------------------USER-TABELLE ERSTELLEN--------------------------

async function syncDatabase() {
    try {
      await sequelize.sync({ force: false }); // Dies erstellt die Tabelle und überschreibt sie, wenn sie bereits existiert
      console.log('All models were synchronized successfully.');
    } catch (error) {
      console.error('Error synchronizing the models:', error);
    }
  }
  
  syncDatabase();