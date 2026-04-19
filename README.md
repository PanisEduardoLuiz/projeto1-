# Projeto Finanças - API & Dashboard

Este projeto é um sistema de lançamentos financeiros (Receitas e Despesas) equipado com uma interface intuitiva, filtros dinâmicos por período, emissão de relatórios em PDF no client-side, e envio automático de notificações por e-mail via **Gmail SMTP**. O sistema conta com controle de acesso, permitindo cadastro e login de múltiplos usuários com persistência em banco de dados relacional.

## 🚀 Novas Funcionalidades e Melhorias

- **Autenticação Completa**: Sistema de cadastro e login por e-mail e senha.
- **Busca por Período**: Filtro de data aprimorado para seleção de intervalos (Data Início e Data Fim).
- **Envio de E-mail via Gmail**: Migração do Resend para Gmail SMTP, permitindo envio para qualquer domínio gratuitamente.
- **Interface Organizada**: Botões de ação (Novo Lançamento, PDF, E-mail) agrupados para melhor usabilidade.
- **Personalização**: Identificação do usuário logado no dashboard e preenchimento automático do e-mail de destino nos relatórios.

---

## 🔑 Configuração do Envio de E-mail (Gmail SMTP)

O sistema utiliza o transporte SMTP do Gmail para disparar e-mails. Para configurar:

1. Acesse sua conta Google e ative a **Verificação em duas etapas**.
2. Gere uma **Senha de App** em [Senhas de App](https://myaccount.google.com/apppasswords).
3. Na raiz do projeto, atualize o arquivo `.env` com suas credenciais:
   ```env
   GMAIL_USER=seu-email@gmail.com
   GMAIL_APP_PASS=suasenha-de-app-sem-espacos
   ```
https://myaccount.google.com/apppasswords?pli=1&rapt=AEjHL4NV7GJcQQ4tp_FRU3yTaJLfgC-Lng6jDWUxxTTyYph58r7qPjBeGTDVXSMGmt_dscQdS_ohk-chF_oDjeLHxJxXr4bEERe7zqkxzz8GcXdsb6Xe1uI


---

## 🛠 Requisitos de Ambiente

- **Node.js** (v18 ou superior)
- **Docker** e **Docker Compose**
- **Git** (para versionamento)

---

## 🚀 Como Rodar o Projeto

### 1. Clonar e Instalar Dependências
```bash
git clone <url-do-repositorio>
cd projeto1--main
npm install
```

### 2. Configurar o Banco de Dados (PostgreSQL via Docker)
Certifique-se de que o Docker está rodando e execute:
```bash
docker-compose down -v  # Limpa volumes antigos se necessário
docker-compose up -d
```
> O banco será inicializado automaticamente com o script `init.sql` na porta **15432**.

### 3. Iniciar o Servidor
```bash
node server.js
```
O servidor estará disponível em `http://localhost:8080`.

---

## 🔒 Acesso ao Sistema

- **Usuário Padrão**: Você pode usar o login `admin` com a senha `admin123`.
- **Novos Usuários**: Utilize a tela de **Cadastro** para criar uma nova conta usando seu e-mail real.

---

## 📧 Fluxo de Notificações

- **Manual**: Botões de "Enviar Email" no dashboard permitem disparar relatórios PDF filtrados ou completos. O e-mail de destino é sugerido automaticamente com base no seu perfil.
- **Automático**: Sempre que um lançamento é **criado ou editado**, uma notificação é enviada para o seu e-mail configurado no `.env`, detalhando as alterações realizadas.

---

## 🧪 Testes Unitários

Para validar a integridade das rotas da API (CRUD e Autenticação), utilize o comando nativo do Node:
```bash
node --test tests/api.test.js
```

---

## 📈 Comandos PM2 (Para Servidores/VMs)

Se for rodar o projeto de forma persistente em uma VM:
- Iniciar: `pm2 start server.js --name "financas-api"`
- Ver Status: `pm2 list`
- Ver Logs: `pm2 logs financas-api`
- Reiniciar: `pm2 restart financas-api`
- Parar: `pm2 stop financas-api`
