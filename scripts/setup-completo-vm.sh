#!/usr/bin/env bash
# Instalação/atualização completa na VM: Git + Docker + Homolog + Prod
# Preserva dados: NÃO usa "docker compose down -v"
#
# Uso na VM:
#   chmod +x scripts/setup-completo-vm.sh
#   ./scripts/setup-completo-vm.sh
#
# Uso remoto (variáveis opcionais):
#   GMAIL_USER=... GMAIL_APP_PASS=... BRANCH=versao-organizada bash setup-completo-vm.sh
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/PanisEduardoLuiz/projeto1-.git}"
BRANCH="${BRANCH:-versao-organizada}"
REMOTE_DIR="${REMOTE_DIR:-$HOME/projeto1-}"
if [[ "$REMOTE_DIR" == ~* ]]; then
  REMOTE_DIR="${REMOTE_DIR/#\~/$HOME}"
elif [[ "$REMOTE_DIR" != /* ]]; then
  REMOTE_DIR="$HOME/$REMOTE_DIR"
fi
GMAIL_USER="${GMAIL_USER:-}"
GMAIL_APP_PASS="${GMAIL_APP_PASS:-}"

log() { echo "[setup] $*"; }

docker_cmd() {
  if docker info &>/dev/null 2>&1; then
    docker "$@"
  else
    sudo docker "$@"
  fi
}

compose_cmd() {
  if ! docker info &>/dev/null 2>&1; then
    if sudo docker compose version &>/dev/null 2>&1; then
      sudo docker compose "$@"
    else
      sudo docker-compose "$@"
    fi
  else
    if docker compose version &>/dev/null 2>&1; then
      docker compose "$@"
    else
      docker-compose "$@"
    fi
  fi
}

ensure_docker() {
  if command -v docker &>/dev/null && (docker compose version &>/dev/null || docker-compose version &>/dev/null); then
    log "Docker já instalado."
    return
  fi
  log "Docker não encontrado. Tentando instalar (sudo)..."
  if command -v apt-get &>/dev/null; then
    sudo apt-get update -qq
    sudo DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-plugin git curl
    sudo systemctl enable --now docker
    sudo usermod -aG docker "$USER" 2>/dev/null || true
    log "Docker instalado. Se falhar permissão, rode: newgrp docker  ou reconecte SSH."
  else
    echo "ERRO: instale Docker manualmente nesta VM e execute de novo."
    exit 1
  fi
}

ensure_git() {
  command -v git &>/dev/null || sudo apt-get install -y git
}

ensure_repo() {
  ensure_git
  if [ -d "$REMOTE_DIR/.git" ]; then
    log "Atualizando repositório em $REMOTE_DIR"
    cd "$REMOTE_DIR"
    git fetch origin
    git reset --hard "origin/$BRANCH"
    git clean -fd
    git checkout "$BRANCH"
    git pull origin "$BRANCH"
  else
    log "Clonando $REPO_URL (branch $BRANCH)"
    git clone -b "$BRANCH" "$REPO_URL" "$REMOTE_DIR"
    cd "$REMOTE_DIR"
  fi
}

write_env_file() {
  local target="$1"
  local example="$2"
  if [ ! -f "$example" ]; then
    echo "ERRO: $example não encontrado."
    exit 1
  fi
  if [ ! -f "$target" ]; then
    cp "$example" "$target"
    log "Criado $target a partir do exemplo."
  else
    log "Mantido $target existente (dados/config preservados)."
  fi
  if [ -n "$GMAIL_USER" ] && [ -n "$GMAIL_APP_PASS" ]; then
    sed -i.bak "s|^GMAIL_USER=.*|GMAIL_USER=$GMAIL_USER|" "$target"
    sed -i.bak "s|^GMAIL_APP_PASS=.*|GMAIL_APP_PASS=$GMAIL_APP_PASS|" "$target"
    rm -f "${target}.bak"
  fi
}

deploy_stack() {
  local compose_file="$1"
  local label="$2"
  log "Subindo $label ($compose_file) — volumes preservados..."
  compose_cmd -f "$compose_file" up -d --build
  compose_cmd -f "$compose_file" exec -T app node scripts/migrate.js
  log "$label OK."
}

health_check() {
  local port="$1"
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${port}/api/lancamentos" || echo "000")
  if [ "$code" = "200" ]; then
    log "Health :${port} -> HTTP $code"
  else
    log "AVISO: :${port} retornou HTTP $code (verifique logs do container)"
  fi
}

main() {
  log "=== Setup completo VM — Projeto Finanças ==="
  ensure_docker
  ensure_repo
  cd "$REMOTE_DIR" || exit 1

  chmod +x scripts/*.sh 2>/dev/null || true

  write_env_file ".env.homolog" ".env.homolog.example"
  write_env_file ".env.prod" ".env.prod.example"
  write_env_file ".env" ".env.example"

  if [ -z "$GMAIL_USER" ] || [ -z "$GMAIL_APP_PASS" ]; then
    log "GMAIL não informado por variável — use .env.homolog / .env.prod já existentes."
  fi

  log "Subindo Banco Local/Dev (porta 15432)..."
  compose_cmd -f "docker-compose.yml" up -d
  log "Instalando pacotes Node (necessário para o migrate local)..."
  npm install --no-fund --no-audit
  log "Rodando migrações do Banco Local..."
  node scripts/migrate.js

  deploy_stack "docker-compose.homolog.yml" "Homologação (8081)"
  deploy_stack "docker-compose.prod.yml" "Produção (8082)"

  VM_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "IP_DA_VM")
  health_check 8081
  health_check 8082

  echo ""
  echo "============================================"
  echo " Concluído (bancos Docker NÃO foram apagados)"
  echo " Homolog:  http://${VM_IP}:8081"
  echo " Produção: http://${VM_IP}:8082"
  echo " Login teste: admin / admin123"
  echo "============================================"
}

main "$@"
