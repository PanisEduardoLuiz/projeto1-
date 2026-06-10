# Passo a passo — GitHub → VM → rodar tudo

Guia para subir o pipeline (Etapas 1–4), validar no GitHub Actions e subir **Homolog** + **Produção** na VM Univates.

| | |
|--|--|
| **Repositório** | https://github.com/PanisEduardoLuiz/projeto1- |
| **VM** | `177.44.248.113` — usuário `univates` |
| **Homolog** | http://177.44.248.113:8081 |
| **Produção** | http://177.44.248.113:8082 |

---

## Parte 1 — Enviar para o GitHub (seu PC)

### 1.1 Conferir o que NÃO pode ir no commit

Estes arquivos ficam só na máquina (já estão no `.gitignore`):

- `.env`
- `.env.homolog`
- `.env.prod`

Use apenas os `*.example` no Git.

### 1.2 Abrir terminal na pasta do projeto

**PowerShell:**

```powershell
cd c:\Users\eduar\projeto1-
```

### 1.3 Ver o que será enviado

```powershell
& "C:\Program Files\Git\bin\git.exe" status
```

Deve aparecer arquivos novos como: `Dockerfile`, `migrations/`, `.github/`, `scripts/`, `README-PIPELINE.md`, etc.

### 1.4 Adicionar e commitar

```powershell
& "C:\Program Files\Git\bin\git.exe" add .
& "C:\Program Files\Git\bin\git.exe" status
```

Confira que **não** entrou `.env` nem `.env.homolog` / `.env.prod`.

```powershell
& "C:\Program Files\Git\bin\git.exe" commit -m "feat: pipeline CI/CD - env, docker homolog/prod, migrações e GitHub Actions"
```

### 1.5 Enviar para a branch `versao-organizada`

```powershell
& "C:\Program Files\Git\bin\git.exe" push origin versao-organizada
```

*(Opcional: depois faça merge ou PR para `main` no GitHub.)*

### 1.6 Validar CI no GitHub

1. Abra https://github.com/PanisEduardoLuiz/projeto1-
2. Aba **Actions** → workflow **CI**
3. Aguarde ficar **verde** (lint + migrate + 20 testes)
4. Baixe o artifact **test-results** se precisar de evidência na apresentação

Se falhar: abra o job e leia o log do passo que quebrou.

---

## Parte 2 — Preparar a VM (uma vez)

Conecte por SSH:

```bash
ssh univates@177.44.248.113
```

### 2.1 Verificar Docker

```bash
docker --version
docker compose version
```

Se não tiver Docker, peça instalação na VM ou instale conforme política da Univates.

### 2.2 Verificar portas livres (opcional)

```bash
ss -tlnp | grep -E '8081|8082|15433|15434' || true
```

Se algo já usar 8081/8082, pare o serviço antigo ou ajuste o compose (só se o professor permitir).

### 2.3 Clonar ou atualizar o projeto

**Primeira vez na VM:**

```bash
cd ~
git clone https://github.com/PanisEduardoLuiz/projeto1-.git
cd projeto1-
git checkout versao-organizada
```

**Se a pasta já existir:**

```bash
cd ~/projeto1-    # ou o caminho onde está o repo
git fetch origin
git checkout versao-organizada
git pull origin versao-organizada
```

---

## Parte 3 — Configurar ambiente na VM

Ainda dentro da pasta do projeto na VM:

### 3.1 Arquivos de configuração (com Gmail)

```bash
cp .env.homolog.example .env.homolog
cp .env.prod.example .env.prod
nano .env.homolog    # ou vi — preencha GMAIL_USER e GMAIL_APP_PASS
nano .env.prod       # mesmo Gmail (ou contas diferentes, se quiser)
```

Não commite esses arquivos.

### 3.2 Scripts executáveis

```bash
chmod +x scripts/*.sh
```

---

## Parte 4 — Subir tudo (um comando só)

**Opção A — do seu PC (PowerShell), após o push no GitHub:**

```powershell
cd c:\Users\eduar\projeto1-
.\scripts\executar-setup-vm.ps1
```

Informe IP `177.44.248.113`, usuário `univates`, branch `versao-organizada` e a **senha SSH** quando pedir. Opcional: Gmail para `.env.homolog` / `.env.prod`.

**Opção B — já logado na VM:**

```bash
cd ~/projeto1-
chmod +x scripts/setup-completo-vm.sh
./scripts/setup-completo-vm.sh
```

Isso faz: Docker (se faltar) → `git pull` → Homolog **8081** → Prod **8082** → migrações. **Preserva dados** dos volumes Docker.

---

## Parte 4b — Subir Homologação (manual, se preferir)

```bash
cd ~/projeto1-
./scripts/deploy-homolog.sh
```

O script faz:

1. `docker compose` build + up (app + Postgres)
2. Migrações (`V001`, `V002`) dentro do container

### 4.1 Conferir containers

```bash
docker ps --filter name=financas
```

Esperado: `app_financas_homolog` e `db_financas_homolog` **Up**.

### 4.2 Testar no navegador

- http://177.44.248.113:8081  
- Login de teste: `admin` / `admin123`

### 4.3 Se não abrir de fora da VM

Firewall pode bloquear. Na VM (se tiver permissão):

```bash
sudo ufw allow 8081/tcp
sudo ufw allow 8082/tcp
```

Ou peça à TI/Univates liberar **8081** e **8082**.

---

## Parte 5 — Subir Produção

```bash
cd ~/projeto1-
./scripts/deploy-prod.sh
```

### 5.1 Conferir

```bash
docker ps --filter name=financas
```

Esperado: também `app_financas_prod` e `db_financas_prod`.

### 5.2 Testar

- http://177.44.248.113:8082  
- Login: `admin` / `admin123`

Homolog e Prod têm **bancos separados** (`financas_homolog` vs `financas_prod`).

---

## Parte 6 — Checklist final (tudo funcionando)

| # | Verificação | OK? |
|---|-------------|-----|
| 1 | Push na `versao-organizada` no GitHub | ☐ |
| 2 | Actions CI verde (20 testes) | ☐ |
| 3 | `docker ps` com 4 containers (2 homolog + 2 prod) | ☐ |
| 4 | http://177.44.248.113:8081 abre o site | ☐ |
| 5 | http://177.44.248.113:8082 abre o site | ☐ |
| 6 | API responde (ex.: `/api/lancamentos`) | ☐ |
| 7 | Migrações aplicadas | ☐ |

**Testar API na VM:**

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:8081/api/lancamentos
curl -s -o /dev/null -w "%{http_code}" http://localhost:8082/api/lancamentos
```

Deve retornar `200`.

**Status das migrações (dentro do container):**

```bash
docker compose -f docker-compose.homolog.yml exec -T app node scripts/migrate.js --status
docker compose -f docker-compose.prod.yml exec -T app node scripts/migrate.js --status
```

Ambas `V001` e `V002` devem aparecer como `[OK]`.

---

## Comandos úteis na VM

**Ver logs da app**

```bash
docker logs app_financas_homolog --tail 30
docker logs app_financas_prod --tail 30
```

**Reiniciar após novo `git pull`**

```bash
git pull origin versao-organizada
./scripts/deploy-homolog.sh
./scripts/deploy-prod.sh
```

**Parar ambientes**

```bash
docker compose -f docker-compose.homolog.yml down
docker compose -f docker-compose.prod.yml down
```

**Parar e apagar dados do banco (cuidado — apaga volumes)**

```bash
docker compose -f docker-compose.homolog.yml down -v
docker compose -f docker-compose.prod.yml down -v
```

Depois rode de novo os scripts de deploy (recria banco + migrações).

---

## Problemas comuns

| Problema | Solução |
|----------|---------|
| `Crie .env.homolog` | `cp .env.homolog.example .env.homolog` e edite |
| `permission denied` no script | `chmod +x scripts/*.sh` |
| Build Docker lento/falha | Confirme internet na VM; rode de novo com `--build` |
| Site não abre fora da VM | Libere portas 8081/8082 no firewall |
| CI falha no GitHub | Veja log em Actions; teste local: `npm run lint` e `npm test` |
| `git` não reconhecido no PC | Use caminho completo: `C:\Program Files\Git\bin\git.exe` |

---

## Fluxo resumido (diagrama)

```
[PC] editar código → commit → push versao-organizada
         ↓
[GitHub] Actions CI (lint + 20 testes)
         ↓
[VM] git pull → .env.homolog + .env.prod → deploy-homolog → deploy-prod
         ↓
    :8081 Homolog    :8082 Produção
```

---

## Referências no projeto

- Resumo das portas: [`README-PIPELINE.md`](../README-PIPELINE.md)
- Detalhe técnico das etapas: [`ETAPAS-CI-CD.md`](ETAPAS-CI-CD.md)
