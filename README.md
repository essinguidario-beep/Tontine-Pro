# TontinePro Lite 🇨🇲

> **La plateforme SaaS moderne pour la gestion transparente des tontines, cotisations et associations au Cameroun en FCFA (XAF).**

TontinePro Lite est une application web progressive (PWA) conçue spécifiquement pour les trésoriers, présidents de tontines, associations d'épargne et groupes d'entraide au Cameroun et en Afrique Centrale.

---

## 🚀 Fonctionnalités Clés

1. **Tableau de Bord Financier en Direct** : Total des cotisations, cagnottes disponibles, taux de recouvrement, cotisations en retard et graphiques d'évolution mensuelle (`recharts`).
2. **Création & Gestion Complète des Tontines** : Montants en FCFA, périodicité (quotidienne, hebdomadaire, mensuelle), types de rotation (ordre prédéfini, enchères, tirage au sort).
3. **Gestion des Membres & Rôles** : Présidents, trésoriers, secrétaires, membres actifs, suivi individuel de l'assiduité et des parts de cotisation.
4. **Enregistrement des Cotisations & Traçabilité** : Validation par le trésorier, modes de versement (Orange Money, MTN MoMo, Espèces, Virement), statuts et dates d'encaissement.
5. **Reçus Officiels Numériques** : Génération instantanée de reçus signés avec référence unique, horodatage et bouton de partage / impression.
6. **Moyens de Paiement Mobile Money Cameroun** :
   - **Orange Money Cameroun** (#150#) avec détection des préfixes (69x, 655-659)
   - **MTN Mobile Money** (*126#) avec détection des préfixes (67x, 68x, 650-654)
   - Badge actif et bouton 1-clic pour copier le numéro de versement
7. **Relances WhatsApp en 1 Clic** : Messages personnalisés préremplis avec montant dû et nom de la tontine envoyés directement vers le WhatsApp du membre en retard.
8. **Gestion des Bénéficiaires & Tours de Cagnotte** : Calendrier des remises de cagnotte, versements effectués et alertes pour les prochains tours.
9. **Dépenses d'Association & Trésorerie** : Suivi des frais de réception, location de salle, cotisations de solidarité et solde net.
10. **Gestion des Retards & Pénalités** : Calcul automatique des pénalités de retard selon le règlement de la tontine.
11. **Rapports Financiers & Exports** : Bilans périodiques complets exportables en CSV et prêts pour l'impression PDF.
12. **Modèle Économique & Abonnements** :
    - Offre Gratuite (1 tontine, jusqu'à 10 membres)
    - Offre Standard à 2 000 FCFA / mois (3 tontines, jusqu'à 50 membres)
    - Offre Premium à 5 000 FCFA / mois (tontines et membres illimités)
13. **Console Super Admin** : Tableau de bord de supervision des paiements d'abonnement Orange Money / MTN MoMo avec approbation manuelle sécurisée.
14. **Journal d'Audit & Sécurité** : Historique infalsifiable de chaque transaction, mise à jour de profil et création de tontine.
15. **Export & Sauvegarde** : Sauvegarde locale instantanée et compatibilité avec base relationnelle Supabase / PostgreSQL.

---

## 🛠️ Stack Technologique

- **Framework Front-end** : React 19 + TypeScript
- **Bundler & Serveur de Dev** : Vite 8
- **Styles & Design** : Tailwind CSS v4 (design mobile-first adapté aux téléphones Android)
- **Icônes & UI** : Lucide React
- **Visualisation de Données** : Recharts
- **Animations & Célébrations** : Canvas Confetti
- **Déploiement** : Prêt pour Netlify, Vercel ou tout hébergeur statique / Node.js

---

## 💻 Installation & Démarrage Local

### Prérequis
- [Node.js](https://nodejs.org/) version 18 ou supérieure
- `npm` ou `yarn` ou `bun`

### 1. Cloner ou extraire le projet
```bash
git clone https://github.com/votre-compte/tontinepro-lite.git
cd tontinepro-lite
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Lancer le serveur de développement
```bash
npm run dev
```
L'application est accessible à l'adresse : `http://localhost:3000`

### 4. Compiler pour la production
```bash
npm run build
```
Le dossier optimisé et minifié `dist/` est alors généré.

---

## 📦 Déploiement sur GitHub

Pour versionner votre projet sur GitHub :

```bash
# 1. Initialiser le dépôt git local
git init

# 2. Ajouter tous les fichiers
git add .

# 3. Créer le premier commit
git commit -m "feat: version complète TontinePro Lite pour le Cameroun"

# 4. Renommer la branche principale en 'main'
git branch -M main

# 5. Lier votre dépôt GitHub distant
git remote add origin https://github.com/votre-nom-utilisateur/tontinepro-lite.git

# 6. Pousser vers GitHub
git push -u origin main
```

---

## 🌐 Déploiement sur Netlify (Gratuit & Rapide)

Le fichier `netlify.toml` est déjà inclus à la racine du projet avec les règles de redirection pour React (SPA).

### Méthode 1 : Via GitHub (Recommandée pour mises à jour automatiques)
1. Rendez-vous sur [Netlify.com](https://www.netlify.com) et connectez-vous.
2. Cliquez sur **Add new site** > **Import an existing project**.
3. Choisissez **GitHub** et sélectionnez le dépôt `tontinepro-lite`.
4. Netlify détecte automatiquement les paramètres configurés dans `netlify.toml` :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
5. Cliquez sur **Deploy site**.
6. Votre application est immédiatement en ligne avec un lien HTTPS (ex: `https://tontinepro-lite.netlify.app`).

### Méthode 2 : Déploiement direct sans Git (Drag & Drop)
1. Lancez `npm run build` sur votre machine.
2. Glissez-déposez simplement le dossier `dist/` généré sur la page [Netlify Drop](https://app.netlify.com/drop).
3. Le site est en ligne en quelques secondes !

---

## 📱 Utilisation sur Android

TontinePro Lite fonctionne directement dans **Google Chrome** sur Android sans téléchargement requis sur le Play Store :
- Ouvrez le site dans Chrome sur votre smartphone Android.
- Cliquez sur le menu de Chrome (les 3 points en haut à droite).
- Sélectionnez **Ajouter à l'écran d'accueil**.
- L'icône TontinePro Lite apparaît sur votre écran d'accueil comme une application native.

---

## 📄 Licence

Distribué sous licence Apache-2.0. Voir le fichier `LICENSE` pour plus de détails.
© 2026 TontinePro Lite - Tous droits réservés.
