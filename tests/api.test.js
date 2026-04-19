const { test, describe, before } = require('node:test');
const assert = require('node:assert');

const API_URL = 'http://localhost:8080/api/lancamentos';

describe('Testes API Lançamentos - 20 Cenários', () => {
    let idDespesaMock = null;
    let idReceitaMock = null;

    // ----- Bloco 1: GET (Leitura Padrão) -----
    test('1. Endpoint raiz (GET /) da API de Lançamentos deve retornar status 200', async () => {
        const res = await fetch(API_URL);
        assert.strictEqual(res.status, 200);
    });

    test('2. A resposta do GET deve ser convertida para um array', async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        assert.ok(Array.isArray(data), 'Retorno não é array');
    });

    test('3. Os elementos retornados pela API devem conter ID (caso existam registros)', async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.length > 0) assert.ok('id' in data[0]);
    });

    test('4. Os elementos devem ter dados numéricos correspondentes a valor', async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.length > 0) assert.ok(!isNaN(Number(data[0].valor)));
    });

    // ----- Bloco 2: POST (Criação de Registros Validos) -----
    test('5. Deve ser possível criar uma DESPESA e recuperar Status 201', async () => {
        const body = {
            descricao: 'Despesa Teste Unitário',
            data_lancamento: '2026-05-01',
            valor: 156.40,
            tipo_lancamento: 'DESPESA',
            situacao: 'PENDENTE'
        };
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        assert.strictEqual(res.status, 201);
        const created = await res.json();
        idDespesaMock = created.id;
        assert.ok(idDespesaMock, 'Deve retornar ID');
    });

    test('6. O registro recém-criado foi salvo como DESPESA', async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        const obj = data.find(x => x.id === idDespesaMock);
        assert.strictEqual(obj.tipo_lancamento, 'DESPESA');
    });

    test('7. Deve ser possível criar uma RECEITA', async () => {
        const body = {
            descricao: 'Receita Teste Unitário',
            data_lancamento: '2026-05-05',
            valor: 999.99,
            tipo_lancamento: 'RECEITA',
            situacao: 'CONCLUIDO'
        };
        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        assert.strictEqual(res.status, 201);
        const created = await res.json();
        idReceitaMock = created.id;
        assert.ok(idReceitaMock, 'Deve retornar ID da Receita');
    });

    test('8. O registro recém-criado foi salvo como RECEITA corretamente', async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        const obj = data.find(x => x.id === idReceitaMock);
        assert.strictEqual(obj.tipo_lancamento, 'RECEITA');
    });

    // ----- Bloco 3: Verificações de Tipagens e Retornos (Regras Simples) -----
    test('9. A data retornada no JSON criado deve ser compatível com YYYY-MM-DD local', async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        const obj = data.find(x => x.id === idReceitaMock);
        const d = new Date(obj.data_lancamento);
        assert.ok(!isNaN(d.getTime()), 'Data retornada inválida');
    });

    test('10. O valor de despesa retornado na lista não deve ser menor que zero nativamente pelo banco (caso use numeric)', async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        const despesa = data.find(x => x.id === idDespesaMock);
        // O valor salvo é > 0
        assert.ok(Number(despesa.valor) >= 0);
    });

    test('11. O nome da descrição persistiu as strings enviadas no POST', async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        const rec = data.find(x => x.id === idReceitaMock);
        assert.strictEqual(rec.descricao, 'Receita Teste Unitário');
    });

    test('12. A situação de registro deve ser identificada por strings (CONCLUIDO/PENDENTE)', async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        const rec = data.find(x => x.id === idReceitaMock);
        assert.strictEqual(typeof rec.situacao, 'string');
    });

    // ----- Bloco 4: PUT (Atualização) -----
    test('13. Atualizar a despesa criada para "CONCLUIDO" (PUT /:id)', async () => {
        const body = {
            descricao: 'Despesa Teste Editada',
            data_lancamento: '2026-05-01',
            valor: 160.00,
            tipo_lancamento: 'DESPESA',
            situacao: 'CONCLUIDO'
        };
        const res = await fetch(`${API_URL}/${idDespesaMock}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        assert.strictEqual(res.status, 200);
    });

    test('14. Validar se a atualização alterou a situação e a descrição no banco', async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        const despesa = data.find(x => x.id === idDespesaMock);
        assert.strictEqual(despesa.situacao, 'CONCLUIDO');
        assert.strictEqual(despesa.descricao, 'Despesa Teste Editada');
    });

    test('15. Tentar atualizar um ID inexistente não retorna 200, mas 404 (Tratamento de erro esperado)', async () => {
        const res = await fetch(`${API_URL}/99999999`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descricao: 'Falso', valor: 0.1 }) // Faltando outros talvez, mas o ID é o teste focal
        });
        assert.strictEqual(res.status, 404);
    });

    // ----- Bloco 5: Comportamento Esperados / Exclusões Isoladas -----
    test('16. Tentar excluir um lançamento inexistente retorna erro 404', async () => {
        const res = await fetch(`${API_URL}/99999999`, {
            method: 'DELETE'
        });
        assert.strictEqual(res.status, 404);
    });

    test('17. A API não deve expor a query de forma que uma falha de conversão seja 200', async () => {
        const res = await fetch(`${API_URL}/AAAABBBB`, {
            method: 'DELETE'
        });
        // Postgres bloqueia cast literal de AAAABBBB pra inteiro, logo backend dará erro (tipicamente 500 ou trata como string)
        assert.notStrictEqual(res.status, 200); 
    });

    // ----- Bloco 6: DELETE (Fim do Ciclo de Vida do Teste) -----
    test('18. Deve ocorrer a exclusão da despesa de teste sem erros', async () => {
        const res = await fetch(`${API_URL}/${idDespesaMock}`, {
            method: 'DELETE'
        });
        assert.strictEqual(res.status, 200);
        const result = await res.json();
        assert.strictEqual(result.message, 'Lançamento excluído com sucesso');
    });

    test('19. A despesa não existe mais após o DELETE', async () => {
        const res = await fetch(API_URL);
        const data = await res.json();
        const achou = data.find(x => x.id === idDespesaMock);
        assert.strictEqual(achou, undefined);
    });

    test('20. Deve ocorrer a exclusão da Receita de teste limpando o banco do sujeira', async () => {
        const res = await fetch(`${API_URL}/${idReceitaMock}`, {
            method: 'DELETE'
        });
        assert.strictEqual(res.status, 200);
    });
});
