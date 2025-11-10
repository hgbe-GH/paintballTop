# Paintball Méditerranée – Site Web

Application Next.js qui alimente le site de Paintball Méditerranée. Ce guide décrit la mise en place du projet en local et la configuration des variables d'environnement nécessaires.

## Prérequis

- Node.js 18+
- npm (inclus avec Node.js)
- Accès aux services externes (base de données, Google Sheets, SMTP, NextAuth, etc.)

## Installation

```bash
npm install
```

## Configuration de l'environnement

Copiez le fichier d'exemple et complétez-le avec vos valeurs :

```bash
cp .env.example .env
```

| Variable | Description | Exemple |
| --- | --- | --- |
| `DATABASE_URL` | Chaîne de connexion à la base de données utilisée par Prisma. | `postgresql://USER:PASSWORD@HOST:PORT/DB` |
| `NEXTAUTH_SECRET` | Clé secrète générée aléatoirement pour sécuriser les sessions NextAuth. | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL publique de l'application utilisée par NextAuth. | `https://paintball.example.com` |
| `SMTP_HOST` | Hôte SMTP pour l'envoi des emails. | `smtp.example.com` |
| `SMTP_PORT` | Port SMTP (généralement 587 pour TLS). | `587` |
| `SMTP_USER` | Identifiant du compte SMTP. | `apikey` |
| `SMTP_PASS` | Mot de passe ou token du compte SMTP. | `secret` |
| `MAIL_FROM` | Adresse e-mail d'expéditeur par défaut. | `"Paintball Méditerranée <no-reply@paintball.example>"` |
| `SHEETS_ENABLED` | Active l'intégration Google Sheets (`true` / `false`). | `true` |
| `GOOGLE_SHEETS_ID` | Identifiant du document Google Sheets. | `1AbC...` |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Email du compte de service Google autorisé sur le document. | `service-account@project.iam.gserviceaccount.com` |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Clé privée du compte de service (format PEM, inclure les retours à la ligne). | `-----BEGIN PRIVATE KEY-----\n...` |
| `ANALYTICS_ID` *(optionnel)* | Identifiant de tracking (ex : GA4). Laisser vide pour désactiver. | `G-XXXXXXX` |

> ℹ️ Pour `GOOGLE_SERVICE_ACCOUNT_KEY`, conservez les retours à la ligne (\n) si vous la stockez sur une seule ligne.

## Tests

Les tests Playwright et Vitest sont configurés dans le projet. Consultez les dossiers `playwright` et `vitest.config.ts` pour plus d'informations.
