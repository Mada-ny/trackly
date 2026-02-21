import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../schema";

/**
 * Hook pour récupérer les paramètres utilisateur de manière réactive.
 */
export function useSettings() {
    return useLiveQuery(
        () => db.settings.get("user_preferences")
    );
}

/**
 * Fonction pour mettre à jour un paramètre spécifique.
 */
export async function updateSetting(key, value) {
    return await db.settings.update("user_preferences", { [key]: value });
}
