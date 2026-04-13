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

### 1. Iniciar o Banco de Dados (PostgreSQL via Docker)
Nós usamos o Docker para empacotar o banco isoladamente na **porta 15432**.
```bash
docker compose up -d
```
*(A tag `-d` faz o container rodar desligado da sua tela, atrelado ao background da máquina. Ele subirá usando a configuração definida no `docker-compose.yml` e script inicial do `init.sql`).*

### 2. Baixar as Dependências da API
O projeto usa pacotes como o Express (servidor), PG (driver do Postgres) e Resend (envio de e-mails). Instale-os com:
```bash
npm install
```

### 3. Criar o arquivo `.env`
Crie o arquivo `.env` na raiz do projeto conforme descrito na seção "Configuração do Envio de E-mail" acima.

### 4. Instalar o PM2 (Process Manager)
O PM2 é o grande responsável por manter sua aplicação web viva 24/7. Instale-o de forma global no seu sistema operacional:
```bash
npm install -g pm2
```
*(Se você receber erros de permissão de pasta no linux, talvez seja necessário rodar com `sudo` na frente: `sudo npm install -g pm2`).*

### 5. Ligar a API Finanças com o PM2
Agora que tudo está pronto, vamos subir o `server.js` chamando o PM2.
```bash
pm2 start server.js --name "projeto-financas"
```
🎉 **A partir deste exato momento, sua API já está disponível no ar via IP da sua VM (ex: `http://177.44.248.113:8080`) e você já pode fechar o seu terminal em paz!**

### 6. Manter o programa ativo entre os Reboots (Opcional)
Se a sua Máquina Virtual desligar ou for reiniciada, para não perder os processos do PM2 salvos, primeiro grave sua lista atual de servidores virtuais:
```bash
pm2 save
```
E em seguida ative a inicialização do gerenciador sob o relógio do Host:
```bash
pm2 startup
```
*(O sistema irá cuspir um comando gigante da cor verde/amarela começando com `sudo ...`. Copie ele inteiro, cole no console e aperte ENTER para registrar o serviço nativo no kernel).*

---

## 📧 Funcionalidade de E-mail

O dashboard possui botões para enviar relatórios por e-mail:

- **Enviar Todos** — Gera um PDF com todos os lançamentos e envia por e-mail.
- **Enviar Filtrados** — Gera um PDF apenas com os lançamentos filtrados e envia por e-mail.

O e-mail é enviado via **API Resend** (HTTP), sem depender de servidores SMTP. O destinatário recebe o PDF como anexo com um corpo em HTML formatado.

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
