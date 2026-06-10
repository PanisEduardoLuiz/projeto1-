# Pipeline CI/CD — Resumo das mudanças

Projeto **Finanças** preparado para dev local → Homolog → Produção (trabalho Univates).

| | |
|--|--|
| **VM** | `177.44.248.113` (usuário `univates`) |
| **GitHub** | [PanisEduardoLuiz/projeto1-](https://github.com/PanisEduardoLuiz/projeto1-) |
| **Branch alvo** | `main` (CI também em `versao-organizada`) |
| **Detalhes por etapa** | [`docs/ETAPAS-CI-CD.md`](docs/ETAPAS-CI-CD.md) |
| **Passo a passo GitHub + VM** | [`docs/PASSO-A-PASSO-GITHUB-VM.md`](docs/PASSO-A-PASSO-GITHUB-VM.md) |

> **Importante:** alterações ainda podem estar só no PC até você fazer `commit` + `push`.

---

## Portas e ambientes

Mesma VM para Homolog e Prod; no PC o app local usa `npm start` (não Docker).

| Ambiente | App | Postgres | Banco | Compose / comando |
|----------|-----|----------|-------|-------------------|
| **Dev (PC)** | `8080` | `15432` | `financas` | `docker compose up -d` + `npm start` |
| **Homolog** | `8081` | `15433` | `financas_homolog` | `docker-compose.homolog.yml` |
| **Produção** | `8082` | `15434` | `financas_prod` | `docker-compose.prod.yml` |

**URLs**

- Local: http://localhost:8080  
- Homolog (VM): http://177.44.248.113:8081  
- Prod (VM): http://177.44.248.113:8082  

Dentro do Docker da app, `DB_HOST=db` e `DB_PORT=5432` (rede interna). Fora do Docker, use as portas da tabela acima.

---

## O que mudou (Etapas 1–4)

| Etapa | Resumo |
|-------|--------|
| **1 — Ambiente** | `config/db.js` e `server.js` leem `.env`; modelos `.env.example`, `.env.homolog.example`, `.env.prod.example` |
| **2 — Docker** | `Dockerfile`, compose homolog/prod (app + Postgres), scripts `scripts/deploy-*.{ps1,sh}` |
| **3 — Banco** | Migrações em `migrations/V00*.sql`, `npm run migrate`, tabela `schema_migrations`; `init.sql` virou legado |
| **4 — CI** | `.github/workflows/ci.yml`: ESLint + migrate + **20 testes** + relatório em `test-results/` |

**Containers:** `db_financas` (dev), `app_financas_homolog` + `db_financas_homolog`, `app_financas_prod` + `db_financas_prod`.

---

## Comandos rápidos

**Desenvolvimento (PC)**

```powershell
copy .env.example .env
docker compose up -d
npm run migrate
npm start
```

**Homolog / Prod no PC (teste)**

```powershell
copy .env.homolog.example .env.homolog
.\scripts\deploy-homolog.ps1
# Prod: copy .env.prod.example .env.prod  →  .\scripts\deploy-prod.ps1
```

**VM Linux (manual)**

```bash
./scripts/deploy-homolog.sh
./scripts/deploy-prod.sh
```

**Tudo de uma vez (recomendado)**

| Onde rodar | Script |
|------------|--------|
| **Seu PC → VM via SSH** | `.\scripts\executar-setup-vm.ps1` (PowerShell) ou `./scripts/executar-setup-vm.sh` (Git Bash) |
| **Direto na VM** | `./scripts/setup-completo-vm.sh` |

Pede IP, usuário, branch; opcional Gmail. **Não apaga** volumes do banco (`down -v` não é usado).

**Qualidade e testes**

```powershell
npm run lint
npm run test          # 20 testes
npm run migrate:status
```

**Parar Docker**

```powershell
docker compose down
docker compose -f docker-compose.homolog.yml down
docker compose -f docker-compose.prod.yml down
```

---

## Arquivos principais (novos ou alterados)

| Tipo | Arquivos |
|------|----------|
| Config | `.env.example`, `config/db.js`, `server.js`, `.gitignore` |
| Docker | `Dockerfile`, `docker-compose.yml`, `docker-compose.homolog.yml`, `docker-compose.prod.yml` |
| Banco | `migrations/`, `scripts/migrate.js` |
| Deploy | `scripts/deploy-homolog.*`, `scripts/deploy-prod.*` |
| CI | `.github/workflows/ci.yml`, `eslint.config.js`, `scripts/ci-test-summary.js` |
| Docs | `README-PIPELINE.md`, `docs/ETAPAS-CI-CD.md` |

---

## Não commitar (segredos)

`.env`, `.env.homolog`, `.env.prod` — use os arquivos `*.example` como modelo.

**GitHub Actions (futuro deploy):** secrets `VM_HOST`, `VM_USER`, `VM_SSH_KEY`.

---

## Próximas etapas (pendentes)

5 — Deploy automático Homolog · 6 — Prod · 7 — Issues/PR · 8 — Diagrama final

---

## Dica Docker

Use a pasta raiz do projeto (`projeto1-`), não `projeto1--main`. O `init.sql` na raiz não é mais montado no Postgres; schema via `npm run migrate`.
