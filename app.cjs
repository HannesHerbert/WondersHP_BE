// Startdatei für Plesk / Phusion Passenger (lädt Apps per require()).
// Das Backend ist ESM mit Top-Level-await, daher per dynamischem import.
// Startfehler zusätzlich nach tmp/startup-error.log, weil Plesk nur eine leere 500-Seite zeigt.
const fs = require("fs");
const path = require("path");

import("./src/index.js").catch((err) => {
    console.error("[Startup] Start fehlgeschlagen:", err);
    try {
        const line = `[${new Date().toISOString()}] NODE_ENV=${process.env.NODE_ENV} ${err && err.stack ? err.stack : err}\n`;
        fs.appendFileSync(path.join(__dirname, "tmp", "startup-error.log"), line);
    } catch { /* Log ist nur Hilfe */ }
    process.exit(1);
});
