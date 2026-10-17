// Einheitliche Aufbereitung von DB-Einträgen für die API

/** Image-Eintrag → { sm, md, lg } (Dateinamen) oder null */
export function toImageUrls(image) {
    if (!image) return null;
    return { sm: image.sourceUrlSM, md: image.sourceUrlMD, lg: image.sourceUrlLG };
}

/** Member inkl. eingebundenem Image → flaches Objekt mit `images` */
export function serializeMember(member) {
    const { image, ...data } = member.toJSON();
    return { ...data, images: toImageUrls(image) };
}

/** HeroArea inkl. eingebundenem Image → API-Format */
export function serializeHeroArea(heroArea) {
    return {
        id: heroArea.id,
        title: heroArea.title,
        text: heroArea.text,
        image_id: heroArea.image_id,
        images: toImageUrls(heroArea.image),
    };
}

const parseJsonArray = (json) => {
    try {
        const value = JSON.parse(json || '[]');
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
};

/** BookingTeaser inkl. eingebundenem Image → API-Format */
export function serializeBookingTeaser(teaser) {
    return {
        id: teaser.id,
        title: teaser.title,
        image_id: teaser.image_id,
        focusX: teaser.focusX,
        focusY: teaser.focusY,
        images: toImageUrls(teaser.image),
        details: parseJsonArray(teaser.detailLayers),
    };
}

/** Übernimmt nur erlaubte Felder, die im Objekt tatsächlich gesetzt sind */
export function pick(source = {}, fields) {
    return Object.fromEntries(
        fields.filter((key) => source[key] !== undefined).map((key) => [key, source[key]])
    );
}

/** Leere Strings / undefined → null (z.B. für Fremdschlüssel aus Formularen) */
export function emptyToNull(value) {
    return value === '' || value === undefined ? null : value;
}
