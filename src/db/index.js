import { Sequelize } from 'sequelize';
import config from '../config/index.js';

const { db } = config;

export const sequelize = new Sequelize(db.name, db.user, db.password, {
    host: db.host,
    port: db.port,
    dialect: 'mysql',
    logging: db.logging ? console.log : false,
    pool: db.pool,
    dialectOptions: db.ssl ? { ssl: { rejectUnauthorized: false } } : undefined,
});

/**
 * sync() legt nur fehlende Tabellen an. Neue Felder bestehender Models werden hier
 * als Spalte ergänzt – rein additiv, vorhandene Spalten bleiben unangetastet.
 */
async function addMissingColumns() {
    const queryInterface = sequelize.getQueryInterface();

    for (const model of Object.values(sequelize.models)) {
        const table = model.getTableName();
        const existing = await queryInterface.describeTable(table);

        for (const [name, attribute] of Object.entries(model.getAttributes())) {
            const column = attribute.field || name;
            if (existing[column]) continue;

            await queryInterface.addColumn(table, column, attribute);
            console.log(`[db] Spalte ergänzt: ${table}.${column}`);
        }
    }
}

/**
 * Verbindet zur Datenbank und synchronisiert die Models.
 * Fehler werden geloggt, damit der Server auch ohne DB startet (Health-Check meldet den Zustand).
 */
export async function initDatabase() {
    try {
        await sequelize.authenticate();
        console.log(`[db] Verbunden mit ${db.host}:${db.port}/${db.name}`);

        await sequelize.sync();
        await addMissingColumns();
        console.log('[db] Models synchronisiert');
        return true;
    } catch (error) {
        console.error('[db] Initialisierung fehlgeschlagen:', error.message);
        return false;
    }
}
