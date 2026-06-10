# Roteiro de Apresentação e Validação do Ambiente

Este documento contém o passo a passo exato para realizar os testes e validações exigidos pelo professor na apresentação final da disciplina de Gerência de Configuração de Software.

## Preparação (Antes de começar)
1. Certifique-se de que não há containers rodando na VM.
2. Acesse a VM por SSH: `ssh univates@177.44.248.113`
3. Pare os ambientes caso estejam rodando:
   ```bash
   cd ~/projeto1-
   docker compose -f docker-compose.homolog.yml down
   docker compose -f docker-compose.prod.yml down
   ```

---

## Passo a Passo dos 13 Testes de Validação

### 1. Apresentar ambientes com a estrutura não existente
- **Ação:** Mostre no navegador os links `http://177.44.248.113:8081` e `http://177.44.248.113:8082`.
- **Resultado Esperado:** O navegador deve exibir "Não é possível acessar esse site" (Página indisponível), provando que não há infraestrutura rodando.

### 2 e 3. Criar ambiente de Homologação e Produção
- **Ação:** No seu computador (Git Bash), execute o script de automação para criar toda a infraestrutura, containers e instalar o projeto:
  ```bash
  ./scripts/executar-setup-vm.sh
  ```
- **Explicação:** Isso demonstrará o "Processo semi-automatizado" e a "Criação da infraestrutura de forma automatizada (contêiner, ferramentas e banco)".

### 4 e 5. Apresentar a aplicação funcionando (Homolog e Prod)
- **Ação:** Abra no navegador:
  - Homologação: `http://177.44.248.113:8081`
  - Produção: `http://177.44.248.113:8082`
- **Resultado Esperado:** O sistema Finanças deve carregar. Faça o login com o usuário `admin` e senha `admin123` em ambos para provar que os bancos foram criados.

### 6. Registrar mudança
- **Ação:** Abra o repositório do projeto no **GitHub**, vá na aba **"Issues"** e clique em **"New Issue"**.
- **Exemplo de título:** `Implementar nova funcionalidade na tela inicial e adicionar migração V003`.
- **Explicação:** Isso comprova o uso de "Ferramenta para Controle de Mudança".

### 7 e 8. Implementar e Versionar
- **Ação:** No VS Code do seu computador:
  1. Altere algum texto visível no código (exemplo: no `public/index.html` ou na página principal do sistema).
  2. Crie um arquivo vazio simulando uma atualização de banco em `migrations/V003__nova_tabela.sql`.
  3. No terminal do VS Code, rode os comandos de versionamento:
     ```bash
     git add .
     git commit -m "Resolvendo Issue #1 - Nova funcionalidade e V003"
     git push origin versao-organizada
     ```

### 9. Realizar integração (Testes, Qualidade e Build)
- **Ação:** No GitHub, vá na aba **"Actions"**.
- **Resultado Esperado:** Mostre ao professor a pipeline rodando automaticamente. Abra os *logs* para mostrar que ela:
  - Rodou a Revisão de Qualidade (`npm run lint`).
  - Subiu um banco efêmero e executou os testes automatizados (`npm test` exibindo os 20 testes passando).
  - Gerou o relatório final de estatísticas de testes na pipeline.

### 10 e 11. Atualizar e Apresentar Homologação + Banco de Dados
- **Ação:** Agora vamos subir a alteração **APENAS** em Homologação. Na VM via SSH, rode:
  ```bash
  cd ~/projeto1-
  git pull origin versao-organizada
  ./scripts/deploy-homolog.sh
  ```
- **Resultado Esperado:** 
  - Abra `http://177.44.248.113:8081` e mostre a palavra nova que você alterou no passo 7. Mostre os logs do terminal indicando que a migração `V003` foi aplicada.
  - Abra `http://177.44.248.113:8082` (Produção) e mostre que ela **NÃO** mudou (ainda tem a palavra antiga), provando que os ambientes são isolados.

### 12 e 13. Atualizar e Apresentar Produção
- **Ação:** Volte ao terminal da VM e rode:
  ```bash
  ./scripts/deploy-prod.sh
  ```
- **Resultado Esperado:** Abra `http://177.44.248.113:8082` e mostre que agora sim a Produção recebeu o código novo e as atualizações do banco de dados, concluindo o ciclo do CI/CD com sucesso.
