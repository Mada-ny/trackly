import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const baseConfig = {
    showProgress: true,
    animate: true,
    allowClose: true,
    opacity: 0.75,
    stagePadding: 4,
    nextBtnText: "Suivant",
    prevBtnText: "Précédent",
    doneBtnText: "Terminer",
    progressText: "{{current}} sur {{total}}",
    popoverClass: "driverjs-theme",
};

/**
 * Tour du Tableau de bord
 */
export const startDashboardTour = () => {
    const tour = driver({
        ...baseConfig,
        steps: [
            {
                popover: {
                    title: "👋 Bienvenue sur Trackly",
                    description: "Votre gestion de budget locale-first. Aucune donnée ne quitte ce téléphone.",
                    side: "center",
                    align: "start"
                }
            },
            {
                element: "#tour-balance-carousel",
                popover: {
                    title: "Solde & Comptes",
                    description: "Glissez pour voir le solde total ou vos comptes individuels. Taper sur la carte permet de basculer entre la forme abrégée et détaillée du montant lorsque celui-ci dépasse 1 million.",
                    side: "bottom",
                    align: "start"
                }
            },
            {
                element: "#tour-fab-button",
                popover: {
                    title: "Ajouter une opération",
                    description: "Revenu ou dépense : tout commence ici.",
                    side: "left",
                    align: "center"
                }
            }
        ]
    });
    tour.drive();
};

/**
 * Tour de la page Rapports
 */
export const startReportsTour = () => {
    const tour = driver({
        ...baseConfig,
        steps: [
            {
                element: "#tour-reports-period",
                popover: {
                    title: "Période d'analyse",
                    description: "Changez de mois pour analyser vos performances passées.",
                    side: "bottom",
                    align: "center"
                }
            },
            {
                element: "#tour-reports-summary",
                popover: {
                    title: "Résumé & Épargne",
                    description: "Visualisez votre taux d'épargne et le volume de vos opérations en un coup d'œil.",
                    side: "bottom",
                    align: "center"
                }
            },
            {
                element: "#tour-reports-categories",
                popover: {
                    title: "Répartition des dépenses",
                    description: "Identifiez vos plus grosses transactions pour un mois donné.",
                    side: "top",
                    align: "center"
                }
            }
        ]
    });
    tour.drive();
};

/**
 * Tour de la page Transactions
 */
export const startTransactionsTour = () => {
    const tour = driver({
        ...baseConfig,
        steps: [
            {
                element: "#tour-transactions-search",
                popover: {
                    title: "Recherche rapide",
                    description: "Trouvez une opération par son nom, sa catégorie ou son compte.",
                    side: "bottom",
                    align: "center"
                }
            },
            {
                element: "#tour-transactions-filters",
                popover: {
                    title: "Filtres avancés",
                    description: "Affinez votre liste par compte, catégorie, type ou période.",
                    side: "bottom",
                    align: "center"
                }
            },
            {
                popover: {
                    title: "Détails & Actions",
                    description: "Cliquez sur une transaction pour voir ses détails, la modifier ou la supprimer.",
                    side: "center",
                    align: "start"
                }
            }
        ]
    });
    tour.drive();
};

/**
 * Tour d'onboarding initial (mixte simplifié)
 */
export const startOnboardingTour = () => {
    const hasSeenTour = localStorage.getItem("trackly-onboarded");
    if (hasSeenTour === "true") return;

    startDashboardTour();
    localStorage.setItem("trackly-onboarded", "true");
};
