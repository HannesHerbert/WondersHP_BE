import { Member, Setting, sequelize } from '../models/index.js';

const MIGRATION_KEY = 'members.order.clockwise';

/**
 * Einmalige Umstellung: Früher gab es 4 Ecken (1 oben links, 2 oben rechts, 3 unten links, 4 unten rechts)
 * plus Special Guests mit eigener Reihenfolge. Jetzt hat jedes Mitglied eine Position im Uhrzeigersinn
 * ab oben (1, 2, 3, …). Die bisherige Anordnung mit eingeblendeten Gästen bleibt dabei erhalten.
 */
export async function migrateMemberOrder() {
    if (await Setting.findByPk(MIGRATION_KEY)) return;

    const members = await Member.findAll();
    const core = members.filter((m) => !m.isGuest);
    const guests = members.filter((m) => m.isGuest).sort((a, b) => a.image_position - b.image_position);
    const byPos = (pos) => core.filter((m) => m.image_position === pos);
    const rest = core.filter((m) => ![1, 2, 3, 4].includes(m.image_position));
    const ordered = [...byPos(2), ...byPos(4), ...rest, ...guests, ...byPos(3), ...byPos(1)];

    await sequelize.transaction(async (transaction) => {
        for (const [index, member] of ordered.entries()) {
            await member.update({ image_position: index + 1, isGuest: false }, { transaction });
        }
        await Setting.create({ key: MIGRATION_KEY, value: new Date().toISOString() }, { transaction });
    });
    console.log(`[db] Mitglieder-Reihenfolge umgestellt (${ordered.length} Mitglieder, im Uhrzeigersinn)`);
}
