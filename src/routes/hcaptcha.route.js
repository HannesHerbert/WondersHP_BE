import express from 'express';
import axios from 'axios';

const HCaptchaRouter = express.Router();

// hCaptcha Verifizierung
HCaptchaRouter.post('/verify', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'hCaptcha Token fehlt.' });
  }

  const secretKey = process.env.HCAPTCHA_SECRET; // Dein hCaptcha Secret Key aus der .env Datei

  try {
    // Anfrage an hCaptcha Verifikationsserver
    const captchaResponse = await axios.post(
      `https://hcaptcha.com/siteverify`,
      {},
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    const captchaData = captchaResponse.data;

    if (captchaData.success) {
      // hCaptcha validiert
      res.json({ success: true, message: 'hCaptcha erfolgreich validiert.' });
    } else {
      res.status(400).json({ success: false, message: 'hCaptcha Verifizierung fehlgeschlagen.' });
    }
  } catch (error) {
    console.error('Fehler bei der hCaptcha-Verifizierung:', error);
    res.status(500).json({ success: false, message: 'Serverfehler bei der hCaptcha-Verifizierung.' });
  }
});

export default HCaptchaRouter;
