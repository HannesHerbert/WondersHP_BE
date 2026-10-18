// Setzt ein neues Passwort für einen bestehenden Admin: npm run set:password -- <benutzername>
// Das Passwort wird verdeckt abgefragt und landet so nicht in der Shell-History.
import readline from 'readline';
import bcrypt from 'bcrypt';
import { sequelize, User } from './src/models/index.js';

const SALT_ROUNDS = 10;
const [username] = process.argv.slice(2);

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

if (!username) {
  console.error('Aufruf: npm run set:password -- <benutzername>');
  process.exit(1);
}

try {
  await sequelize.authenticate();
  const user = await User.findOne({ where: { username } });
  if (!user) throw new Error(`Benutzer "${username}" gibt es nicht`);

  const password = await askHidden('Neues Passwort: ');
  const repeat = await askHidden('Passwort wiederholen: ');
  if (password.length < 12) throw new Error('Passwort muss mindestens 12 Zeichen haben');
  if (password !== repeat) throw new Error('Passwörter stimmen nicht überein');

  await User.update({ password: await bcrypt.hash(password, SALT_ROUNDS) }, { where: { id: user.id } });
  console.log(`Passwort für "${username}" geändert.`);
} catch (error) {
  console.error('Ändern fehlgeschlagen:', error.message);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
