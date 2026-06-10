# Manual de Treinamento e Testes em Aula

Este documento é um "Cheat Sheet" (guia rápido) feito a partir das nossas conversas para você treinar e simular situações que o professor possa pedir na hora da apresentação.

## 1. Como provar a "Qualidade de Código" ao vivo
Se o professor pedir para ver a análise de qualidade rodando na máquina:
1. Abra o terminal do VS Code.
2. Rode o comando:
   ```bash
   npm run lint
   ```
3. **O que responder:** *"O comando varreu todo o código. Como ele não imprimiu nenhum erro na tela e apenas encerrou, isso prova que o código está 100% no padrão de qualidade exigido pelo ESLint, sem débitos técnicos."*

## 2. Como mostrar o "Versionamento do Banco de Dados"
Se ele pedir para provar como o banco atualiza:
1. Abra o terminal do VS Code e rode:
   ```bash
   npm run migrate:status
   ```
2. **O que responder:** *"Esse comando acessa o banco e lista as migrações. Os `[OK]` na frente do V001 e V002 mostram que o sistema sabe exatamente a versão atual do banco. Se eu rodar um V003, ele aplica apenas a novidade sem perder os dados."*

## 3. Cenário: "Mude uma palavra e jogue só na Homologação"
Se ele quiser testar o isolamento dos ambientes:
1. Mude um título qualquer no arquivo `public/index.html`.
2. Commit e envie para o GitHub:
   ```bash
   git add .
   git commit -m "Alterando título para teste do professor"
   git push origin versao-organizada
   ```
3. Puxe e suba **somente** na Homologação acessando a VM:
   ```bash
   ssh univates@177.44.248.113
   cd ~/projeto1-
   git pull origin versao-organizada
   ./scripts/deploy-homolog.sh
   ```
4. Mostre a porta `:8081` atualizada e a porta `:8082` (Produção) com o texto antigo.

## 4. Cenário: "Como provo que a integração barra código quebrado?"
Se ele pedir para mostrar a segurança dos Testes Automatizados na nuvem:
1. Abra o seu repositório no GitHub: `https://github.com/PanisEduardoLuiz/projeto1-`
2. Vá até a aba **"Actions"**.
3. Abra a bolinha verde do último commit e clique no "Job" (ex: *build-and-test*).
4. Expanda a linha que diz **`Run npm test`**.
5. **O que responder:** *"Aqui estão os 20 testes rodando na nuvem. A esteira levantou um banco de dados limpo, fez as inserções de teste e deu check verde nos 20 cenários. Se eu tentasse enviar um código quebrado, essa aba inteira ficaria com um X Vermelho e o código seria barrado de ir para Homologação."*

*(Dica: Treine todos esses 4 passos na sua máquina local antes da aula!)*
