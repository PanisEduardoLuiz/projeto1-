# Pipeline CI/CD — Projeto Finanças

Documentação etapa a etapa do ambiente **Integração → Homologação → Produção**.

| Dado | Valor |
|------|--------|
| VM Univates | `177.44.248.113` |
| Usuário SSH | `univates` |
| Homolog + Prod | Mesma VM, **portas diferentes** |
| Versionamento | GitHub — branch **`main`** |
| CI/CD | GitHub Actions |

---

## Etapa 1 — Variáveis de ambiente (concluída)

### O que foi pedido

Separar configuração de **desenvolvimento local**, **homologação** e **produção** sem alterar código a cada deploy.

### O que implementamos

| Arquivo | Função |
|---------|--------|
| `.env.example` | Modelo de variáveis (sem senhas reais) |
| `config/db.js` | Lê `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` |
| `server.js` | Lê `PORT`, `HOST`, `APP_ENV` / `NODE_ENV` |
| `.gitignore` | Já ignora `.env` (credenciais não vão pro Git) |

### Variáveis principais

| Variável | Local (dev) | Homolog (VM) | Produção (VM) |
|----------|-------------|--------------|---------------|
| `APP_ENV` | `development` | `homolog` | `production` |
| `PORT` | `8080` | `8081` | `8082` |
| `DB_PORT` | `15432` | `15433` | `15434` |
| `DB_NAME` | `financas` | `financas_homolog` | `financas_prod` |

> Portas de Homolog/Prod serão usadas nos `docker-compose` da **Etapa 2**.

### Como usar no seu PC

```powershell
cd c:\Users\eduar\projeto1-
copy .env.example .env
# Edite .env com Gmail e senhas locais
npm start
```

Acesse: `http://localhost:8080`

### Segurança da VM

- **Não** coloque senha SSH no repositório.
- Na **Etapa 5/6**, configure no GitHub: **Settings → Secrets → Actions**:
  - `VM_HOST` = `177.44.248.113`
  - `VM_USER` = `univates`
  - `VM_SSH_KEY` = chave privada SSH

---

## Etapa 2 — Docker (app + banco) Homolog/Prod (concluída)

### O que implementamos

| Arquivo | Função |
|---------|--------|
| `Dockerfile` | Build da aplicação Node |
| `docker-compose.homolog.yml` | Stack completa homolog — portas **8081** / **15433** |
| `docker-compose.prod.yml` | Stack completa prod — portas **8082** / **15434** |
| `scripts/deploy-homolog.sh` / `.ps1` | Deploy semi-automático homolog |
| `scripts/deploy-prod.sh` / `.ps1` | Deploy semi-automático prod |
| `.env.homolog.example` / `.env.prod.example` | Config por ambiente (`DB_HOST=db` no container) |

### Comandos na VM

```bash
./scripts/deploy-homolog.sh
./scripts/deploy-prod.sh
```

Resumo completo: [`README-PIPELINE.md`](../README-PIPELINE.md)

---


## Etapa 3 — Versionamento do banco (migrações) (concluída)

### O que implementamos

| Item | Detalhe |
|------|---------|
| `migrations/V001__*.sql` | Schema inicial + seeds idempotentes |
| `migrations/V002__*.sql` | Índice em `data_lancamento` |
| `scripts/migrate.js` | Runner + tabela `schema_migrations` |
| `npm run migrate` | Local |
| Deploy scripts | Executam migrate no container após `up` |

Resumo: [`README-PIPELINE.md`](../README-PIPELINE.md#etapa-3--versionamento-do-banco-migrações)

---

## Etapa 4 — GitHub Actions (testes + qualidade + estatísticas) (concluída)

### O que implementamos

| Item | Detalhe |
|------|---------|
| `.github/workflows/ci.yml` | CI em push/PR para `main` e `versao-organizada` |
| Postgres service | Banco efêmero na pipeline |
| `npm run migrate` | Schema antes dos testes |
| 20 testes | `tests/api.test.js` via `node --test` |
| ESLint | `npm run lint` |
| Estatísticas | `scripts/ci-test-summary.js` + artifact `test-results/` |
| Relatório JUnit | `test-results/junit.xml` |

Resumo: [`README-PIPELINE.md`](../README-PIPELINE.md#etapa-4--github-actions-ci)

### Secrets (Etapas 5/6 — deploy na VM)

`VM_HOST`, `VM_USER`, `VM_SSH_KEY` em **Settings → Secrets → Actions**

---

## Etapa 5 — Deploy semi-automático Homologação

_Status: pendente_

---

## Etapa 6 — Deploy semi-automático Produção

_Status: pendente_

---

## Etapa 7 — Registro de mudança (Issues/PR)

_Status: pendente_

---

## Etapa 8 — Diagrama de arquitetura + entrega final

_Status: pendente_

---

## Roteiro dos 13 passos (validação)

Usar na apresentação após todas as etapas — ver enunciado da disciplina.
