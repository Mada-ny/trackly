/**
 * Formate un nombre en devise (XOF par défaut).
 * @param {number} amount - Le montant à formater.
 * @param {Object} options - Options de formatage.
 * @param {boolean} options.compact - Si vrai, utilise la notation compacte pour les grands nombres (ex: 1,2M).
 * @param {string} options.currency - Le code de la devise (par défaut: 'XOF').
 * @param {number} options.maximumFractionDigits - Nombre maximum de décimales (par défaut: 0).
 * @returns {string} La chaîne de caractères formatée.
 */
export function formatCurrency(amount, { 
    compact = false, 
    currency = 'XOF', 
    maximumFractionDigits = null 
} = {}) {
    // Détermination intelligente des décimales si non spécifiées
    const defaultDigits = (currency === 'XOF') ? 0 : 2;
    const finalFractionDigits = maximumFractionDigits !== null ? maximumFractionDigits : defaultDigits;

    const options = {
        style: 'currency',
        currency,
        maximumFractionDigits: finalFractionDigits,
        minimumFractionDigits: finalFractionDigits,
    };

    const compactThreshold = currency === 'XOF' ? 1000000 : 100000;
    
    if (compact && Math.abs(amount) >= compactThreshold) {
        options.notation = 'compact';
        options.compactDisplay = 'short';
        options.maximumFractionDigits = 2; 
    }

    try {
        let formatted = new Intl.NumberFormat('fr-FR', options).format(amount);
        
        // Correction pour les milliards : Intl peut retourner "Bn" ou "B".
        // On détermine le pluriel en fonction du nombre affiché (singulier si < 2).
        if (compact && (formatted.includes('Bn') || formatted.includes(' B'))) {
            const numericMatch = formatted.match(/^-?[\d\s,.]+/);
            if (numericMatch) {
                const numericValue = parseFloat(numericMatch[0].replace(/\s/g, '').replace(',', '.'));
                const isPlural = Math.abs(numericValue) >= 2;
                const suffix = isPlural ? '\u00A0Mds' : '\u00A0Md';
                formatted = formatted.replace(/\s?Bn/g, suffix).replace(/\s?B(?=\s|$)/g, suffix);
            }
        }
        
        return formatted;
    } catch (error) {
        console.error("Erreur de formatage de devise:", error);
        return `${amount.toLocaleString('fr-FR')} ${currency}`;
    }
}
