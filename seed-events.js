// Legt Beispiel-Termine an: node wonders-be/seed-events.js
import { sequelize, Event } from './src/models/index.js';

const events = [
  { date: '2023-05-12', time: '20:00', venue: 'Stadtfest', street: 'Marktplatz 1', postalCode: '10115', city: 'Berlin', isPublic: true },
  { date: '2023-08-20', time: '19:30', venue: 'Sommer Open Air', street: 'Parkstraße 10', postalCode: '80331', city: 'München', isPublic: true },
  { date: '2023-11-05', time: '21:00', venue: 'Club Night', street: 'Reeperbahn 25', postalCode: '20359', city: 'Hamburg', isPublic: true },
  { date: '2024-02-14', time: '18:00', venue: 'Valentins-Gala', street: 'Schlossplatz 1', postalCode: '70173', city: 'Stuttgart', isPublic: false },
  { date: '2024-04-30', time: '20:00', venue: 'Tanz in den Mai', street: 'Festhalle 5', postalCode: '50667', city: 'Köln', isPublic: true },
  { date: '2024-06-15', time: '15:00', venue: 'Firmenjubiläum', street: 'Industriepark 12', postalCode: '60311', city: 'Frankfurt', isPublic: false },
  { date: '2024-09-22', time: '19:00', venue: 'Herbstfest', street: 'Dorfplatz 3', postalCode: '04109', city: 'Leipzig', isPublic: true },
  { date: '2024-12-31', time: '22:00', venue: 'Silvesterparty', street: 'Rathausplatz 1', postalCode: '40213', city: 'Düsseldorf', isPublic: true },
  { date: '2025-03-10', time: '20:30', venue: 'Frühlingsball', street: 'Kulturhaus 8', postalCode: '28195', city: 'Bremen', isPublic: true },
  { date: '2025-07-05', time: '18:00', venue: 'Hochzeit Anna & Tom', street: 'Gutshof 1', postalCode: '14467', city: 'Potsdam', isPublic: false },
  { date: '2025-10-18', time: '21:00', venue: 'Oktoberfest', street: 'Festwiese 2', postalCode: '80336', city: 'München', isPublic: true },
  { date: '2026-01-20', time: '19:00', venue: 'Neujahrsempfang', street: 'Kongresszentrum 4', postalCode: '01067', city: 'Dresden', isPublic: false },
  { date: '2026-05-01', time: '14:00', venue: 'Maifest', street: 'Bürgerpark 1', postalCode: '30159', city: 'Hannover', isPublic: true },
  { date: '2026-08-15', time: '20:00', venue: 'Strandparty', street: 'Promenade 10', postalCode: '18119', city: 'Rostock', isPublic: true },
  { date: '2026-11-28', time: '19:30', venue: 'Weihnachtsmarkt Eröffnung', street: 'Altstadt 1', postalCode: '90403', city: 'Nürnberg', isPublic: true },
];

try {
  await sequelize.authenticate();
  await Event.bulkCreate(events);
  console.log(`${events.length} Events angelegt.`);
} catch (error) {
  console.error('Seeding fehlgeschlagen:', error);
  process.exitCode = 1;
} finally {
  await sequelize.close();
}
