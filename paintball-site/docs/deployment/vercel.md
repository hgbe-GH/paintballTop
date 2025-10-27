# Déploiement sur Vercel

Ce guide décrit la configuration recommandée pour déployer l'application Next.js sur Vercel avec Prisma.

## 1. Variables d'environnement

1. Copiez le fichier `.env.production.example` vers `.env.local` (pour un développement) ou utilisez-le comme référence pour configurer les variables dans Vercel.
2. Dans le dashboard Vercel, section **Settings → Environment Variables**, créez les variables suivantes pour les environnements `Production`, `Preview` et `Development` selon vos besoins :
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `SMTP_HOST`
   - `SMTP_PORT`
   - `SMTP_USER`
   - `SMTP_PASS`
   - `MAIL_FROM`

> **Astuce :** conservez les valeurs sensibles hors du dépôt. Utilisez `vercel env pull` pour récupérer les variables localement si nécessaire.

## 2. Construction Next.js (App Router)

Vercel détecte automatiquement les projets Next.js App Router. Utilisez la configuration par défaut :

- **Build Command** : `npm run build`
- **Install Command** : `npm install`
- **Output Directory** : automatique (`.vercel/output` gérée par Vercel)

Le fichier `vercel.json` fourni dans le dépôt fixe ces commandes et force l'utilisation de la runtime Node.js 20 pour les fonctions serverless. Assurez-vous que Node.js 20 est également sélectionné dans les paramètres du projet.

## 3. Prisma – génération du client

Le script `postinstall` exécute `prisma generate` après chaque installation des dépendances. Cela garantit que le client Prisma est prêt pendant la phase de build.

## 4. Migration de la base de données

Les migrations Prisma ne doivent pas être exécutées pendant la phase de build Vercel. Utilisez l'une des approches suivantes :

- **Job manuel** : déclenchez manuellement `npx prisma migrate deploy` après chaque déploiement (`vercel deploy`), via votre pipeline CI/CD ou avec la commande `npm run prisma:migrate:deploy`.
- **Au démarrage** : si vous utilisez un worker/bot dédié (par exemple un script exécuté avant le lancement d'un serveur long terme), appelez `prisma migrate deploy` avant de démarrer l'application.

Pensez à configurer `DATABASE_URL` pour pointer vers votre base de données managée (Neon, PlanetScale, etc.).

### Sauvegardes et restauration

Planifiez une sauvegarde quotidienne de votre base PostgreSQL via un job externe (cron, worker, CI) en suivant la procédure décrite dans [`docs/deployment/backup-postgres.md`](./backup-postgres.md). Ce guide fournit un script `pg_dump` prêt à l'emploi et détaille les étapes de restauration avec `pg_restore`.

## 5. Tests continus (optionnel)

Un workflow GitHub Actions est fourni (`.github/workflows/test.yml`). Il exécute les tests (`npm run test`) et l'analyse lint (`npm run lint`) sur chaque pull request. Adaptez ce workflow si vous utilisez un autre système CI.

> Exécutez ces vérifications avant vos déploiements Vercel pour garantir la stabilité de l'application.
