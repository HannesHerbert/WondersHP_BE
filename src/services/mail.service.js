import nodemailer from 'nodemailer';
import config from '../config/index.js';

const { mail } = config;

export const isMailConfigured = () => Boolean(mail.host && mail.to);

let transport;
function getTransport() {
    transport ??= nodemailer.createTransport({
        host: mail.host,
        port: mail.port,
        secure: mail.port === 465,
        auth: mail.user ? { user: mail.user, pass: mail.pass } : undefined,
    });
    return transport;
}

/** Schickt eine neue Kontaktanfrage ans Band-Postfach. "Antworten" geht direkt an den Absender. */
export async function notifyContactRequest({ name, email, message }) {
    if (!isMailConfigured()) return;
    await getTransport().sendMail({
        from: `"Jody Cooper & the Wonders – Website" <${mail.from}>`,
        to: mail.to,
        replyTo: { name, address: email },
        subject: `Neue Anfrage von ${name}`,
        text: `${message}\n\n–\n${name}\n${email}\n\nGesendet über das Kontaktformular der Website.`,
    });
}
