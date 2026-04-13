# Projeto Finanças - API & Dashboard

Este projeto é um sistema de lançamentos financeiros (Receitas e Despesas) equipado com uma interface limpa, filtros em tempo real, emissão de relatórios em PDF no client-side, **envio de relatórios por e-mail via API Resend** e as operações completas de CRUD (Create, Read, Update, Delete) através do banco de dados relacional.

## Requisitos de Ambiente (Máquina/VM Jovem)

Antes de rodar a aplicação em uma nova Máquina Virtual (VM), certifique-se de que ela possui instalados:
1. **Node.js** (e o gerenciador de pacotes `npm`)
2. **Docker** (para subir o banco de dados)
3. **Docker Compose** (Versão 2, rodando como `docker compose` ou `docker-compose`)

---

## 🔑 Configuração do Envio de E-mail (Resend)

O sistema utiliza a API **Resend** para disparar e-mails reais com relatórios em PDF anexados. Para configurar:

1. Crie uma conta gratuita em [resend.com](https://resend.com)
2. Gere uma **API Key** no painel do Resend
3. Na raiz do projeto, crie um arquivo chamado `.env` com o seguinte conteúdo:
   ```
   RESEND_API_KEY=re_SUA_CHAVE_AQUI "re_YLnk7zde_PRErQVKLHS4nn5JPUTBkjPmE"
   ```
4. Substitua `re_SUA_CHAVE_AQUI` pela chave real gerada no passo 2.

> **⚠️ Importante:** No plano gratuito do Resend (usando `onboarding@resend.dev` como remetente), você só pode enviar e-mails para o e-mail cadastrado na conta. Para enviar para outros destinatários, é necessário verificar um domínio próprio em [resend.com/domains](https://resend.com/domains).

> **🔒 Segurança:** O arquivo `.env` já está no `.gitignore` e **não será enviado ao GitHub**. Nunca compartilhe sua chave de API publicamente.

---

## 🚀 Como subir o projeto em uma VM Nova (Modo Produção/Background)

Quando você clona ou transfere este código para uma nova VM, o sistema precisa ser reinstalado e configurado para rodar "no escuro" (background), assim garantimos que se você fechar a janela SSH, o aplicativo não cairá.

Siga os exatos passos abaixo na aba do terminal da raiz do seu projeto:

### 1. Instalar Node.js e npm (caso ainda não tenha)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install -y nodejs npm

# Verificar se instalou corretamente
node -v
npm -v
```

### 2. Instalar Docker e Docker Compose (caso ainda não tenha)
```bash
# Ubuntu/Debian
sudo apt install -y docker.io docker-compose-v2

# Dar permissão ao seu usuário para rodar docker sem sudo
sudo usermod -aG docker $USER

# Reinicie o terminal ou faça logout/login para aplicar a permissão
```

### 3. Inicializar o projeto Node (já feito, mas caso precise recriar)
```bash
npm init -y
```

### 4. Instalar TODAS as dependências do projeto (um por um)
```bash
# Servidor web
npm install express

# Driver do banco PostgreSQL
npm install pg

# Leitura de variáveis de ambiente (.env)
npm install dotenv

# API de envio de e-mails
npm install resend

# (Opcional/Legado) Transporte SMTP de e-mails
npm install nodemailer
```

> **💡 Atalho:** Se preferir instalar tudo de uma vez só, basta rodar:
> ```bash
> npm install
> ```
> Esse comando lê o `package.json` e instala todos os pacotes automaticamente.

### 5. Criar o arquivo `.env`
Crie o arquivo `.env` na raiz do projeto conforme descrito na seção "Configuração do Envio de E-mail" acima.

### 6. Subir o Banco de Dados (PostgreSQL via Docker)
```bash
docker compose up -d
```
*(A tag `-d` faz o container rodar em background. Ele usa a configuração do `docker-compose.yml` e o script `init.sql`).*

### 7. Instalar o PM2 (Process Manager — mantém a API viva 24/7)
```bash
npm install -g pm2
```
*(Se der erro de permissão no Linux, use `sudo npm install -g pm2`).*

### 8. Iniciar a API com o PM2
```bash
pm2 start server.js --name "projeto-financas"
```
🎉 **Pronto! Sua API está no ar em `http://localhost:8080` (ou pelo IP da VM). Pode fechar o terminal em paz!**

### 9. Manter ativo após reiniciar a máquina (Opcional)
```bash
pm2 save
pm2 startup
```
*(O sistema vai mostrar um comando com `sudo ...`. Copie e cole para registrar o serviço no boot).*

---

## 📧 Funcionalidade de E-mail

O dashboard possui botões para enviar relatórios por e-mail e também **disparos automáticos**:

- **Envio Automático (Triggers)** — Sempre que um Lançamento for **criado ou editado**, a API dispara no *background* um e-mail de notificação. Nas edições, as informações antigas e novas são apresentadas e comparadas magicamente.
- **Enviar Todos / Filtrados** — A partir do site, é possível gerar relatórios em PDF estáticos e enviá-los em anexo.

As comunicações utilizam a **API Resend** (HTTP), de forma assíncrona, para jamais travarem as requisições principais do usuário!

---

## 🧪 Testes Unitários Nativos (Node.js)

O projeto conta com o diretório `tests/` contendo o arquivo `api.test.js` com um total de **20 testes unitários** automatizados. Eles garantem a segurança de ponta-a-ponta nos serviços (Bloqueios do CRUD de POST, PUT, DELETE, GET e Tratamentos de Dados).

Os testes foram escritos inteiramente com a ferramenta nativa do próprio Node (`node:test`), ou seja, **não exigem instalação de pacotes de testes extra** (como Jest).

Para rodá-los e ter a validação total no terminal da sua máquina, certifique-se de que a aplicação `server.js` está ativa e rode numa **nova aba** de terminal:
```bash
node --test tests/api.test.js
```

---

## 🛠 Comandos Úteis do Dia-A-Dia

Se num futuro você reabrir a VM porque deu algum problema ou quer ver os rastros que os usuários deixaram nos logs sem acessar a tela web:

- Ver tudo que está online no momento:
  ```bash
  pm2 list
  ```
- Ver os "prints" ou erro da API (Logs em tempo real):
  ```bash
  pm2 logs
  ```
- Reiniciar o software após você ter programado / editado linhas novas de código:
  ```bash
  pm2 restart projeto-financas
  ```
- Parar o sistema:
  ```bash
  pm2 stop projeto-financas
  ```
