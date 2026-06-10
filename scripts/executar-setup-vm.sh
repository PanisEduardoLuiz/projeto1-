#!/usr/bin/env bash
# Mesmo que executar-setup-vm.ps1 — para Git Bash / Linux / macOS
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SETUP="$SCRIPT_DIR/setup-completo-vm.sh"

echo ""
echo "=== Instalador remoto — VM ==="
echo "Preserva volumes Docker (nao apaga banco)."
echo ""

read -rp "IP da VM [177.44.248.113]: " VM_HOST
VM_HOST=${VM_HOST:-177.44.248.113}
read -rp "Usuario SSH [univates]: " VM_USER
VM_USER=${VM_USER:-univates}
read -rp "Branch [versao-organizada]: " BRANCH
BRANCH=${BRANCH:-versao-organizada}
read -rp "Pasta na VM [projeto1-]: " REMOTE_DIR
REMOTE_DIR=${REMOTE_DIR:-projeto1-}
read -rp "URL GitHub [https://github.com/PanisEduardoLuiz/projeto1-.git]: " REPO_URL
REPO_URL=${REPO_URL:-https://github.com/PanisEduardoLuiz/projeto1-.git}

read -rp "Gmail (Enter = manter .env na VM): " GMAIL_USER
GMAIL_APP_PASS=""
if [ -n "$GMAIL_USER" ]; then
  read -rsp "Senha app Gmail: " GMAIL_APP_PASS
  echo ""
fi

TARGET="${VM_USER}@${VM_HOST}"
REMOTE_TMP="/tmp/setup-completo-vm-$$.sh"

echo ""
echo "Conectando em $TARGET (senha SSH se pedir)..."
scp "$SETUP" "${TARGET}:${REMOTE_TMP}"

ENV_CMD="export REPO_URL='${REPO_URL}'; export BRANCH='${BRANCH}'; export REMOTE_DIR='${REMOTE_DIR}'"
if [ -n "$GMAIL_USER" ]; then
  ENV_CMD+="; export GMAIL_USER='${GMAIL_USER}'; export GMAIL_APP_PASS='${GMAIL_APP_PASS}'"
fi

ssh "$TARGET" "${ENV_CMD}; sed -i 's/\r$//' ${REMOTE_TMP}; chmod +x ${REMOTE_TMP}; bash ${REMOTE_TMP}; rm -f ${REMOTE_TMP}"

echo ""
echo "Homolog:  http://${VM_HOST}:8081"
echo "Producao: http://${VM_HOST}:8082"
