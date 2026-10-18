// Legt das Repertoire aus den Songsheets (ASSETS!!/Wonders_sheets) an: npm run seed:repertoire
// Eine durchgehende Liste (Titel + Interpret). Reihenfolge: Set 1–4, Zugaben, dann Songs nur aus „Alte Versionen“;
// innerhalb eines Sets alphabetisch wie die Sheet-Dateien.
// Schreibweisen bereinigt: Steely Dan, Leo Sayer, Keb' Mo', The Black Crowes, Jive Talkin'.
import { sequelize, Song } from './src/models/index.js';

const REPERTOIRE = {
  'Set 1': [
    ["Don't Be Afraid Of The Dark", 'Robert Cray'],
    ['Get Down On It / Ladies Night', 'Kool & The Gang'],
    ['Good Times', 'Chic'],
    ['Hard To Handle', 'Otis Redding / The Black Crowes'],
    ["I Can't Go For That", 'Daryl Hall & John Oates'],
    ['More Than One Way Home', "Keb' Mo'"],
    ['Super Freak', 'Rick James'],
    ['Treasure', 'Bruno Mars'],
    ['Use Me', 'Bill Withers'],
    ['WOT', 'Captain Sensible'],
  ],
  'Set 2': [
    ["Ain't Nobody", 'Chaka Khan'],
    ['Do It Again', 'Steely Dan'],
    ['Faith', 'George Michael'],
    ['Get Lucky', 'Daft Punk'],
    ['I Need A Dollar', 'Aloe Blacc'],
    ["Isn't She Lovely", 'Stevie Wonder'],
    ['Locked Out Of Heaven', 'Bruno Mars'],
    ['My Girl', 'The Temptations'],
    ['Nothing From Nothing', 'Billy Preston'],
    ['Ride Like The Wind', 'Christopher Cross'],
  ],
  'Set 3': [
    ['Higher & Higher', 'Jackie Wilson'],
    ['I Wish', 'Stevie Wonder'],
    ["Jive Talkin'", 'Bee Gees'],
    ['Lovely Day', 'Bill Withers'],
    ['Miss You', 'The Rolling Stones'],
    ["Money's Too Tight To Mention", 'Simply Red'],
    ['Riders On The Storm', 'The Doors'],
    ['Sledgehammer', 'Peter Gabriel'],
    ["What's Going On", 'Marvin Gaye'],
    ['You Make Me Feel Like Dancing', 'Leo Sayer'],
  ],
  'Set 4': [
    ['Disco Inferno', 'The Trammps'],
    ["Don't Stop 'Til You Get Enough", 'Michael Jackson'],
    ["Gimme Some Lovin'", 'The Spencer Davis Group'],
    ['I Feel Good', 'James Brown'],
    ['Kiss', 'Prince'],
    ["Let's Dance", 'David Bowie'],
    ['September', 'Earth, Wind & Fire'],
    ["Somebody's Watching Me", 'Rockwell'],
    ["That's The Way I Like It", 'KC & The Sunshine Band'],
    ['Tutti Frutti', 'Little Richard'],
    ['Uptown Funk', 'Bruno Mars & Mark Ronson'],
  ],
  Zugabe: [
    ['Thunder In My Heart', 'Leo Sayer'],
    ['You Should Be Dancing', 'Bee Gees'],
  ],
  // Nur in "Alte Versionen – Songverläufe" vorhanden, nicht in den aktuellen Sets
  Archiv: [
    ['Get Back', 'The Beatles'],
    ['Happy', 'Pharrell Williams'],
    ['Heard It Through The Grapevine', 'Marvin Gaye'],
    ['Word Up', 'Cameo'],
  ],
};

try {
  await sequelize.authenticate();
  await Song.sync();
  const existing = await Song.count();
  if (existing > 0) {
    console.log(`Repertoire enthält schon ${existing} Songs – nichts angelegt.`);
  } else {
    const rows = Object.values(REPERTOIRE).flat().map(([title, artist], index) => ({ title, artist, position: index + 1 }));
    await Song.bulkCreate(rows);
    console.log(`${rows.length} Songs angelegt.`);
  }
} catch (error) {
  console.error('Seeding fehlgeschlagen:', error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
