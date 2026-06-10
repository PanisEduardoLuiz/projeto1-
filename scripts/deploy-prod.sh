#!/usr/bin/env bash
# VM Univates — sobe ambiente de Produção (porta 8082)
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f .env.prod ]; then
  echo "Crie .env.prod a partir de .env.prod.example"
  exit 1
fi

docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec -T app node scripts/migrate.js
echo "Produção: http://$(hostname -I | awk '{print $1}'):8082"
