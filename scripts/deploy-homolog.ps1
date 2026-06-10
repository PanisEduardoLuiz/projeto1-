# Local ou VM Windows — Homologação
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Test-Path ".env.homolog")) {
    Copy-Item ".env.homolog.example" ".env.homolog"
    Write-Host "Arquivo .env.homolog criado. Edite com Gmail antes de usar em produção."
}

docker compose -f docker-compose.homolog.yml up -d --build
docker compose -f docker-compose.homolog.yml exec -T app node scripts/migrate.js
Write-Host "Homologação: http://localhost:8081"
