# Sauvegardes quotidiennes de la base de données

Ce guide explique comment configurer un script externe (serveur, VM, job CI ou service managé) pour réaliser une sauvegarde quotidienne de la base PostgreSQL utilisée par l'application. Il détaille également la procédure de restauration à partir d'un dump généré par le script.

> 💡 Adaptez les instructions en fonction de votre hébergeur (Neon, Supabase, Render, Railway, etc.). La logique reste la même : exécuter `pg_dump` depuis une machine disposant d'un accès réseau à la base et stocker le fichier produit dans un espace persistant (S3, stockage objet, disque chiffré, …).

## 1. Préparer le script de sauvegarde

Un script shell est fourni dans `scripts/backup_postgres.sh`. Il génère un dump au format `custom` (compatible `pg_restore`) et supprime les sauvegardes plus anciennes que la période de rétention définie.

```bash
#!/usr/bin/env bash
set -euo pipefail

# Variables requises
export DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Variables optionnelles
export BACKUP_DIR="$HOME/paintball-backups"  # dossier local de stockage
export RETENTION_DAYS=7                       # nombre de jours de rétention
export FILENAME_PREFIX="paintball_db"         # préfixe du nom de fichier

/path/to/repo/scripts/backup_postgres.sh
```

- Assurez-vous que `pg_dump` est disponible sur la machine d'exécution (paquet `postgresql-client`).
- Configurez le script pour qu'il puisse se connecter à votre base managée (souvent via un tunnel SSL ou une IP autorisée).
- Redirigez les dumps vers un emplacement persistant ou synchronisé (bucket S3, stockage objet, etc.).

## 2. Planifier l'exécution quotidienne

### Exemple avec `cron` sur une VM ou un serveur dédié

1. Copiez (ou déployez) le script sur la machine qui exécutera la sauvegarde.
2. Configurez les variables d'environnement dans un fichier dédié (par exemple `/etc/paintball/db-backup.env`).
3. Ajoutez l'entrée suivante au crontab de l'utilisateur qui exécutera la sauvegarde :

```bash
0 2 * * * source /etc/paintball/db-backup.env && /path/to/scripts/backup_postgres.sh >> /var/log/paintball-db-backup.log 2>&1
```

Cet exemple lance la sauvegarde tous les jours à 02:00 du matin. Adaptez l'horaire à votre fuseau horaire et aux fenêtres de maintenance de l'hébergeur.

### Exemple avec un job planifié géré par l'hébergeur

- **Neon** : utilisez un job programmé (Scheduled Branch) ou un worker externe qui se connecte via le point d'accès fourni par Neon.
- **Supabase** : configurez un cron dans les "Scheduled Functions" ou via un job GitHub Actions avec un secret `DATABASE_URL`.
- **Railway/Render** : créez un service worker ou un cron job qui exécute le script avec `DATABASE_URL` injecté depuis les variables d'environnement du projet.

Dans tous les cas, vérifiez que :

- la machine/job a accès au réseau (firewall, allow list d'IP, SSL) ;
- les identifiants utilisés sont limités au strict nécessaire (lecture seule suffisante pour `pg_dump`).

## 3. Vérifier les sauvegardes

- Contrôlez régulièrement la taille et la fraîcheur des fichiers de dump.
- Automatisez l'envoi d'une notification (mail, Slack, etc.) en cas d'échec du script (le code de sortie est différent de 0).
- Testez la restauration sur une base de test pour valider vos sauvegardes.

## 4. Procédure de restauration

La restauration doit être effectuée sur une base vide (nouvelle base ou base remise à zéro). Les dumps produits sont au format `custom`, ce qui permet une restauration sélective ou complète avec `pg_restore`.

### Étapes

1. **Provisionner la base cible**
   - Créez une nouvelle base (ex : `paintball_restore`) sur votre hébergeur ou localement.
   - Mettez à jour temporairement la variable `DATABASE_URL` si besoin.

2. **Récupérer le dump**
   - Téléchargez le fichier `.dump` depuis votre stockage.
   - Vérifiez son intégrité (checksum, taille attendue).

3. **Restaurer avec `pg_restore`**

```bash
createdb paintball_restore
pg_restore \
  --clean \
  --if-exists \
  --no-owner \
  --dbname=paintball_restore \
  /chemin/vers/paintball_db-20240101-020000.dump
```

Options utiles :

- `--clean --if-exists` supprime les objets avant restauration (pratique pour écraser une base de test).
- `--schema=public` pour restaurer un schéma spécifique si nécessaire.
- `--table=...` pour restaurer une table isolée.

4. **Reconfigurer Prisma / l'application**
   - Mettez à jour `DATABASE_URL` pour pointer vers la base restaurée si vous voulez tester l'application dessus.
   - Exécutez `npx prisma migrate deploy` si vous restaurez sur une base vierge et souhaitez appliquer les dernières migrations avant ou après la restauration selon votre stratégie.

5. **Valider**
   - Lancez l'application ou connectez-vous à la base pour vérifier que les données sont cohérentes.
   - Supprimez les fichiers de dump sensibles une fois la restauration validée.

## 5. Bonnes pratiques supplémentaires

- Chiffrez les dumps au repos (par exemple avec `gpg` ou en utilisant un bucket S3 avec chiffrement côté serveur activé).
- Stockez les identifiants de connexion dans un gestionnaire de secrets (Vercel, GitHub Actions, AWS Secrets Manager, etc.).
- Documentez qui est responsable de vérifier les sauvegardes et la restauration.
- Testez la procédure au moins une fois par trimestre.

En suivant cette procédure, vous disposez d'une sauvegarde quotidienne externalisée et d'une méthode reproductible pour restaurer votre base PostgreSQL en cas d'incident.
