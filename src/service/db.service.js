import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

dotenv.config();

export const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: 'localhost',
    dialect: 'mysql'
});

export async function connectToDb(callback) {
    console.log("Trying to connect to DB");
  try {
      await sequelize.authenticate();
      console.log('Connection to database successfully.');

      if (callback) {
        callback();
    }

    } catch (err) {
      console.error('Unable to connect to the DB:', err);
    }
}