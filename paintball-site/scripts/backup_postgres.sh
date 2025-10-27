#!/usr/bin/env bash
set -euo pipefail

if [[ "${DEBUG:-}" == "1" ]]; then
  set -x
fi

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "[backup_postgres] DATABASE_URL environment variable is required" >&2
  exit 1
fi

BACKUP_DIR=${BACKUP_DIR:-"$HOME/paintball-backups"}
RETENTION_DAYS=${RETENTION_DAYS:-7}
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
FILENAME_PREFIX=${FILENAME_PREFIX:-"paintball_db"}

mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/${FILENAME_PREFIX}-${TIMESTAMP}.dump"

pg_dump --no-owner --format=custom --file="$BACKUP_FILE" "$DATABASE_URL"

find "$BACKUP_DIR" -type f -name "${FILENAME_PREFIX}-*.dump" -mtime +"$RETENTION_DAYS" -print -delete

printf "Backup completed: %s\n" "$BACKUP_FILE"
