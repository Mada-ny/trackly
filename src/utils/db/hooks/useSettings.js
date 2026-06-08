import { useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../schema";

let cachedSettings;

/**
 * Hook pour récupérer les paramètres utilisateur de manière réactive.
 * Réutilise la dernière valeur connue comme valeur par défaut le temps que
 * la requête IndexedDB résolve, pour éviter le flash "texte par défaut -> nom
 * réel" à chaque montage de page (ex: navigation Accueil <-> Réglages).
 */
export function useSettings() {
    const settings = useLiveQuery(
        () => db.settings.get("user_preferences"),
        [],
        cachedSettings
    );

    useEffect(() => {
        if (settings !== undefined) cachedSettings = settings;
    }, [settings]);

    return settings;
}

/**
 * Fonction pour mettre à jour un paramètre spécifique.
 */
export async function updateSetting(key, value) {
    return await db.settings.update("user_preferences", { [key]: value });
}
