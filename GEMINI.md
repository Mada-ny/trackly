# Trackly - Development Log

## 🚀 Vision
Trackly is a mobile-first PWA designed to provide a fluid, secure, and fully offline budget management experience. The app focuses on rapid entry and clear strategic reporting.

## 🛠 Current State (v1.2)
L'application a été renforcée pour une meilleure fiabilité des données et une ergonomie mobile sans faille.

### 1. Identity & UX
- **Branding**: Trackly identity with "Mint & Forest" OKLCH palette.
- **Floating Navigation**: Nouveau comportement "Hide on Scroll" pour la barre de navigation mobile et le bouton d'action principal (FAB).
- **FAB Dynamique**: Le bouton "+" est désormais un menu compact proposant le choix entre "Transaction" et "Virement", avec une animation de rotation et un code couleur émeraude.
- **Affichage & Défilement**: Utilisation de `dvh` (Dynamic Viewport Height) pour éliminer les sauts de mise en page sur mobile. Correction du débordement des champs `time` sur iOS Safari.
- **Amount Display**: Composant `AmountDisplay` intelligent avec effet marquee et bascule de vue compacte/complète.

### 2. Reports & Intelligence
- **Monthly Reports**: Analyse calendaire avec calcul précis du taux d'épargne.
- **Improved Logic**: Les virements sont traités comme une opération unique. Fallback automatique sur le signe de la transaction en l'absence de catégorie.
- **Hybrid Charts**: Tendances de solde en temps réel couplées à la visualisation des flux.

### 3. Reliability & Performance
- **Validation du Solde**: Blocage systématique des transactions et virements si le solde du compte est insuffisant, avec notification d'erreur explicite.
- **Formulaires Robustes**: 
    - Affichage des erreurs de validation sur tous les champs (y compris Date et Heure).
    - Validation du futur assouplie avec une tolérance d'une minute.
    - Description minimum ramenée à 2 caractères pour une saisie plus rapide.
- **Anti-Flicker**: Délai de 200ms sur les états de chargement pour éviter les clignotements sur les accès locaux rapides.
- **Error Handling**: Implémentation `try/catch` robuste dans les hooks de données pour éviter les écrans de chargement infinis.

## 📋 Next Steps
- [ ] **Cloud Backup**: Optional encrypted end-to-end synchronization.
- [ ] **Multi-currency**: Automatic amount conversion with exchange rates.
- [ ] **PWA Reminders**: Push notifications to encourage daily logging.
- [ ] **Global Search**: Quick access to transactions from anywhere via `Ctrl+K`.

---
*Last update: March 24, 2026*

PS: Everytime you make a notable change, update this file.
