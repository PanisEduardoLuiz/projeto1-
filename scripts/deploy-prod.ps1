# Local ou VM Windows — Produção
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")

if (-not (Test-Path ".env.prod")) {
    Copy-Item ".env.prod.example" ".env.prod"
    Write-Host "Arquivo .env.prod criado. Edite com Gmail antes de usar em produção."
}

docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml exec -T app node scripts/migrate.js
Write-Host "Produção: http://localhost:8082"
