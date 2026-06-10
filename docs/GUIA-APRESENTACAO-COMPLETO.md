# 🎓 Guia Completo: Apresentação e Testes (Passo a Passo)

Este guia reúne todos os cenários práticos que podem ser cobrados pelo professor na hora da apresentação. Ele descreve o que fazer, o que falar e **ONDE** rodar cada comando para que você não se perca durante a demonstração.

---

## 🛑 Passo Zero: Limpar o Ambiente (Preparação antes da aula)
Garante que o servidor comece a apresentação do zero, sem nada rodando.

* **Onde executar:** Terminal do VS Code (conectado na VM)
* **Comandos:**
```bash
ssh univates@177.44.248.113
cd ~/projeto1-
docker compose -f docker-compose.homolog.yml down
docker compose -f docker-compose.prod.yml down
exit
```

---

## 1️⃣ Provar que a Infraestrutura não existe
* **Onde executar:** Navegador Web
* **Ação:** Acesse as portas `http://177.44.248.113:8081` (Homologação) e `http://177.44.248.113:8082` (Produção).
* **O que falar:** *"Professor, como pode ver, não há nenhum serviço no ar. A página dá erro, provando que vamos criar a estrutura do zero."*

---

## 2️⃣ Subir a Infraestrutura Automatizada
* **Onde executar:** Terminal local do seu computador (Git Bash / VS Code)
* **Ação:** Execute o script de provisionamento:
```bash
./scripts/executar-setup-vm.sh
```
* **O que falar:** *"Esse comando acessa a máquina virtual, instala ferramentas necessárias, e constrói de forma automatizada toda a infraestrutura com contêineres e bancos de dados para Homologação e Produção."*

---

## 3️⃣ Validar que a Aplicação subiu
* **Onde executar:** Navegador Web
* **Ação:** Volte às portas `8081` e `8082` e faça o login com `admin` e `admin123`.
* **O que falar:** *"O sistema subiu nos dois ambientes. O login ter funcionado significa que as migrações (V001 e V002) aplicaram os scripts no banco de dados automaticamente durante a inicialização."*

---

## 4️⃣ O Pulo do Gato: Versionamento do Banco de Dados 
* **Onde executar:** Terminal local do seu computador (VS Code)

**Passo A (Status Atual):**
1. Rode `npm run migrate:status`
2. **Falar:** *"Aqui, o sistema reconhece que o banco já está na versão V002."*

**Passo B (Simular a nova versão):**
1. No VS Code, crie o arquivo `migrations/V003__tabela_aula.sql` com o código: `CREATE TABLE tabela_aula (id SERIAL PRIMARY KEY);`
2. Rode novamente `npm run migrate:status`.
3. **Falar:** *"Criei um arquivo e o sistema identificou automaticamente a versão V003 como [PENDENTE]."*

**Passo C (Aplicar a Migração):**
1. Rode `npm run migrate`.
2. Rode `npm run migrate:status` pela última vez.
3. **Falar:** *"A mágica aconteceu: a versão V003 mudou para [OK]. A nova tabela foi criada sem apagar os dados do V001 e V002. Quando o código for para produção, essa automação rodará sozinha lá também."*

---

## 5️⃣ Controle de Mudança (Ferramenta de Tracking)
* **Onde executar:** Site do GitHub (Aba "Issues")
* **Ação:** Crie uma Issue com o nome: `Criar nova funcionalidade na interface e migração V003`.
* **O que falar:** *"Antes de subir nossa alteração de código e banco que acabamos de testar, documentamos na Issue para rastreabilidade."*

---

## 6️⃣ Fazer uma Alteração Visível no Código
* **Onde executar:** VS Code (Editor de Arquivos local)
* **Ação:** Abra o arquivo `public/index.html` e altere algum texto (Ex: Troque "Finanças" para "Finanças Aula Univates").

---

## 7️⃣ Versionar e Enviar para a Nuvem
* **Onde executar:** Terminal local do seu computador (VS Code)
* **Comandos:**
```bash
git add .
git commit -m "feat: alterando titulo e enviando V003 (Issue #1)"
git push origin versao-organizada
```

---

## 8️⃣ Qualidade de Código e Testes na Nuvem (CI)
* **Onde executar:** Site do GitHub (Aba "Actions")
* **Ação:** Mostre a bolinha verde rodando na sua pipeline de CI/CD.
* **O que falar:** *"O push interceptou o código. A esteira validou os padrões do código via Lint e subiu um banco efêmero para aprovar os 20 testes automatizados. Se algo estivesse quebrado, a bolinha ficaria vermelha e o código não seguiria em frente."*

---

## 9️⃣ Deploy em Homologação
* **Onde executar:** Terminal da VM (`ssh univates@177.44.248.113`)
* **Comandos:**
```bash
cd ~/projeto1-
git pull origin versao-organizada
./scripts/deploy-homolog.sh
```

---

## 🔟 Provar o Isolamento dos Ambientes
* **Onde executar:** Navegador Web
* **Ação 1:** Atualize a Homologação (`8081`). O texto novo vai aparecer! *"Homologação recebeu as mudanças de código e banco de dados."*
* **Ação 2:** Atualize a Produção (`8082`). O texto será o antigo. *"Produção segue ilesa. Prova de que os ambientes são independentes e isolados."*

---

## 1️⃣1️⃣ Deploy em Produção
* **Onde executar:** Terminal da VM (`ssh univates@177.44.248.113`)
* **Comandos:**
```bash
./scripts/deploy-prod.sh
```

---

## 1️⃣2️⃣ Validação Final
* **Onde executar:** Navegador Web
* **Ação:** Atualize a Produção (`8082`) e mostre o texto novo aplicado.
* **O que falar:** *"Com as mudanças validadas em ambiente seguro, concluímos o ciclo inteiro aplicando o pacote final ao ambiente de Produção com sucesso."*

---

# 🧠 EXTRAS: Testes ao Vivo e "Pegadinhas" do Professor

Se o professor quiser testar o seu conhecimento ao vivo para ter certeza de que você domina a infraestrutura, aqui estão as cartas na manga.

### Extra 1: "Mostre o teste de Qualidade de Código (Lint) falhando"
O professor pode pedir para você provar que a esteira realmente barra código ruim.
* **Onde executar:** Terminal local (VS Code)
* **Passo 1:** Abra o arquivo `server.js`.
* **Passo 2:** Escreva na última linha uma variável ou função que não existe (Ex: `funcaoQuebradaDoProfessor();`) e salve o arquivo.
* **Passo 3:** Rode no terminal: `npm run lint`.
* **O que vai aparecer:** Um erro vermelho (Ex: `'funcaoQuebradaDoProfessor' is not defined no-undef`).
* **A sua explicação:** *"O sistema identificou a infração na linha X. Se eu tentasse enviar isso pro repositório agora, a esteira do GitHub Actions quebraria na hora e não deixaria o código ir para a Homologação."*
* **Passo 4:** Apague a linha, salve, rode `npm run lint` e mostre que agora ele passa de forma limpa e silenciosa.

### Extra 2: A Pegadinha de Apagar Migrações do Banco
O professor pode perguntar: *"E se você já subiu as versões V001 e V002 do banco, mas alguém for lá no código e deletar o arquivo V001.sql? O banco vai perder tudo e começar do V002?"*
* **A sua resposta:** *"Depende do estado atual do banco, professor!"*
  * **Cenário A (Banco já existe):** *"Se o banco já estiver rodando, nada acontece! Nosso sistema guarda uma tabela interna (`schema_migrations`) que anota o que já rodou. Se o V001 for apagado da pasta, o sistema ignora e roda apenas o V003 sem perder nenhum dado."*
  * **Cenário B (Começando um banco do zero):** *"Se formatarmos o servidor, subirmos um banco do absoluto zero, e o V001 tiver sido deletado do repositório, aí sim o sistema vai tentar rodar o V002 direto e vai quebrar! Mas isso é um comportamento de segurança esperado. O versionamento de banco é 'append-only' (apenas adição). Nós nunca apagamos migrações antigas, pois elas são a fotografia histórica da evolução do banco."*
