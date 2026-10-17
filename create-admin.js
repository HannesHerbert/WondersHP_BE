// Legt einen Admin-User an: npm run create:admin -- <benutzername> <email>
// Das Passwort wird interaktiv abgefragt und landet so nicht in der Shell-History.
import readline from 'readline';
import bcrypt from 'bcrypt';
import { sequelize, User } from './src/models/index.js';

const SALT_ROUNDS = 10;
const [username, email] = process.argv.slice(2);

function askHidden(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    // Eingabe nicht anzeigen
    rl._writeToOutput = (text) => { if (text.startsWith(question)) rl.output.write(text); };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write('\n');
      resolve(answer);
    });
  });
}

if (!username || !email) {
  console.error('Aufruf: npm run create:admin -- <benutzername> <email>');
  process.exit(1);
}

try {
  const password = await askHidden('Passwort: ');
  const repeat = await askHidden('Passwort wiederholen: ');

  if (password.length < 8) throw new Error('Passwort muss mindestens 8 Zeichen haben');
  if (password !== repeat) throw new Error('Passwörter stimmen nicht überein');

  await sequelize.authenticate();
  await User.sync();
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ username, email, password: hash });
  console.log(`Admin "${user.username}" angelegt (id ${user.id}).`);
} catch (error) {
  console.error('Anlegen fehlgeschlagen:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
