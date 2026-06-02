# Ymmo — Prestige Immobilier

Plateforme immobilière haut de gamme avec interface publique, espace admin et messagerie client.

Stack : **Express + Prisma + PostgreSQL** (backend) · **React + Vite + TailwindCSS** (frontend)

---

## Prérequis (Windows)

| Outil | Version minimale | Téléchargement |
|-------|-----------------|----------------|
| Node.js | 20 LTS | https://nodejs.org |
| PostgreSQL | 15 | https://www.postgresql.org/download/windows/ |
| Git | récent | https://git-scm.com |

---

## Installation

### 1. Cloner le dépôt

```powershell
git clone https://github.com/Accoows/Ymmo.git
cd Ymmo
```

### 2. Base de données PostgreSQL

Ouvrir **pgAdmin** ou le terminal `psql` et créer la base :

```sql
CREATE DATABASE ymmo;
```

### 3. Variables d'environnement — Backend

Créer `backend\.env` :

```env
DATABASE_URL="postgresql://postgres:VOTRE_MOT_DE_PASSE@localhost:5432/ymmo"
JWT_SECRET="une-chaine-aleatoire-longue-et-secrete"
PORT=3000
FRONTEND_URL="http://localhost:5173"
```

> **Important :** `JWT_SECRET` est obligatoire. Le serveur refusera de démarrer sans lui.

### 4. Installer les dépendances

```powershell
# Backend
cd backend
npm install

# Frontend (dans un autre terminal)
cd ..\frontend
npm install
```

### 5. Générer le client Prisma et appliquer les migrations

```powershell
cd backend
npx prisma migrate dev
npx prisma generate
```

### 6. Peupler la base (données de démonstration)

```powershell
cd backend
npm run seed
```

Cela crée :
- Un compte administrateur : `admin@prestige-immobilier.fr` / `Admin123!`
- 6 propriétés de démonstration (villas, appartements, maisons)
- 3 types de biens

---

## Lancer le projet

Ouvrir **deux terminaux** :

**Terminal 1 — Backend**

```powershell
cd backend
npm run dev
```

Le serveur démarre sur `http://localhost:3000`

**Terminal 2 — Frontend**

```powershell
cd frontend
npm run dev
```

L'interface est disponible sur `http://localhost:5173`

---

## Structure du projet

```
Ymmo/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modèles de données
│   │   └── migrations/            # Historique des migrations
│   ├── src/
│   │   ├── controllers/           # Logique métier
│   │   │   ├── auth.controller.ts
│   │   │   ├── contact.controller.ts
│   │   │   ├── property.controller.ts
│   │   │   └── propertyType.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.ts            # JWT authenticate / authorize
│   │   │   └── errorHandler.ts    # Gestion centralisée des erreurs
│   │   ├── routes/                # Définition des endpoints
│   │   ├── schemas/               # Validation Zod
│   │   ├── lib/prisma.ts          # Singleton client Prisma
│   │   ├── utils/jwt.ts           # Sign / verify tokens
│   │   ├── app.ts                 # Point d'entrée Express
│   │   └── seed.ts                # Données de démonstration
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── admin/
    │   │   │   └── MessagesPanel.tsx  # Tableau de bord messages
    │   │   ├── layout/               # Navbar, Footer, Layout
    │   │   └── ui/                   # Composants réutilisables
    │   ├── context/AuthContext.tsx   # État d'authentification global
    │   ├── hooks/                    # React Query hooks
    │   ├── lib/
    │   │   ├── api.ts                # Client Axios
    │   │   └── queryClient.ts        # Configuration React Query
    │   ├── pages/                    # Pages de l'application
    │   ├── types/index.ts            # Types TypeScript partagés
    │   └── App.tsx                   # Routeur principal
    └── package.json
```

---

## API — Endpoints principaux

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `POST` | `/api/auth/register` | — | Créer un compte |
| `POST` | `/api/auth/login` | — | Connexion |
| `GET` | `/api/auth/me` | ✓ | Profil utilisateur |
| `GET` | `/api/properties` | — | Liste filtrée + paginée |
| `GET` | `/api/properties/featured` | — | Bien mis en avant |
| `GET` | `/api/properties/:id` | — | Détail d'un bien |
| `POST` | `/api/properties` | Admin | Créer un bien |
| `PUT` | `/api/properties/:id` | Admin | Modifier un bien |
| `DELETE` | `/api/properties/:id` | Superadmin | Supprimer un bien |
| `GET` | `/api/property-types` | — | Types de biens + compteurs |
| `POST` | `/api/contact` | — | Envoyer un message |
| `GET` | `/api/contact` | Admin | Lister les messages |
| `DELETE` | `/api/contact/:id` | Admin | Supprimer un message |
| `POST` | `/api/uploads` | Admin | Téléverser des photos (multipart) |
| `GET` | `/uploads/:file` | — | Récupérer un fichier téléversé |

### Paramètres de filtrage — `GET /api/properties`

| Paramètre | Type | Description |
|-----------|------|-------------|
| `search` | string | Recherche dans nom, localisation, description |
| `type` | string | Filtrer par type de bien |
| `minPrice` / `maxPrice` | number | Fourchette de prix |
| `minSurface` / `maxSurface` | number | Fourchette de surface (m²) |
| `minBedrooms` | number | Nombre de chambres minimum |
| `minBathrooms` | number | Nombre de salles de bain minimum |
| `minGarage` | number | Nombre de garages minimum |
| `sort` | `recent` \| `price_asc` \| `price_desc` \| `surface_desc` | Tri |
| `page` | number | Page (défaut : 1) |
| `limit` | number | Résultats par page (max 50, défaut 12) |

---

## Rôles utilisateurs

| Rôle | Droits |
|------|--------|
| `User` | Consultation, envoi de messages |
| `AgencyHead` | + Création et modification de biens, lecture des messages |
| `Admin` | + Suppression de messages |
| `Superadmin` | + Suppression de biens |

---

## Fonctionnalités

### Interface publique
- **Accueil** : bien mis en avant, présentation de l'agence
- **Catalogue** : liste filtrée (type, prix, surface, chambres…) avec tri et pagination
- **Fiche bien** : galerie photos, statistiques, formulaire de contact pré-rempli
- **Contact** : formulaire général

### Espace administration (`/admin`)
- **Onglet Propriétés** : tableau de gestion (création, modification, suppression) avec pagination. Les **photos sont téléversées** (vrais fichiers stockés et servis par le serveur), avec miniatures et suppression.
- **Onglet Messages** : liste des messages clients avec toutes les informations (nom, email, téléphone, sujet, message complet, bien associé cliquable), réponse par email directe, suppression avec confirmation

### Photos des biens
Les images sont **téléversées via le formulaire admin** (`POST /api/uploads`, réservé admin), stockées dans `backend/uploads/` (UUID, images uniquement, max 5 Mo) et servies en statique sur `/uploads/<fichier>`. Le dossier `uploads/` est ignoré par git. Les URLs externes restent acceptées (données de démonstration).

---

## Commandes utiles

```powershell
# Backend — démarrer en mode watch
cd backend && npm run dev

# Backend — peupler la base
cd backend && npm run seed

# Frontend — démarrer en mode développement
cd frontend && npm run dev

# Frontend — build de production
cd frontend && npm run build

# Vérification des types TypeScript (frontend)
cd frontend && npx tsc --noEmit -p tsconfig.app.json
```

---

## Dépannage courant (Windows)

**`Error: JWT_SECRET doit être défini`**
→ Vérifier que le fichier `backend\.env` existe et contient `JWT_SECRET`.

**`Can't reach database server`**
→ S'assurer que le service PostgreSQL est démarré : `Win + R` → `services.msc` → chercher « postgresql ».

**Port 3000 ou 5173 déjà utilisé**
→ Changer `PORT` dans `backend\.env`, ou tuer le processus :
```powershell
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**`prisma generate` échoue**
→ S'assurer que `DATABASE_URL` est correctement défini dans `backend\.env`.
