#!/usr/bin/env bash
# VM Univates — sobe ambiente de Homologação (porta 8081)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env.homolog ]; then
  echo "Crie .env.homolog a partir de .env.homolog.example"
  exit 1
fi

docker compose -f docker-compose.homolog.yml up -d --build
docker compose -f docker-compose.homolog.yml exec -T app node scripts/migrate.js
echo "Homologação: http://$(hostname -I | awk '{print $1}'):8081"
