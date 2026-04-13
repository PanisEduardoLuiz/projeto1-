document.addEventListener('DOMContentLoaded', () => {
    let todosLancamentos = [];
    let dadosAtuaisFiltrados = [];
    const corpoTabela = document.getElementById('tabela-corpo');
    const filtroDescricao = document.getElementById('filtro-descricao');
    const filtroData = document.getElementById('filtro-data');
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroSituacao = document.getElementById('filtro-situacao');
    const btnLimpar = document.getElementById('btn-limpar-filtros');
    
    // Elementos do Modal
    const modalLancamento = document.getElementById('modal-lancamento');
    const btnAbrirModal = document.getElementById('btn-abrir-modal');
    const btnFecharModal = document.getElementById('btn-fechar-modal');
    const formLancamento = document.getElementById('form-lancamento');
    const modalTitulo = document.getElementById('modal-titulo');

    function carregarDados() {
        fetch('/api/lancamentos')
            .then(response => response.json())
            .then(dados => {
                todosLancamentos = dados;
                aplicarFiltros();
            })
            .catch(erro => {
                console.error('Erro ao buscar lançamentos:', erro);
                corpoTabela.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Erro ao carregar os dados.</td></tr>';
            });
    }

    function renderizarTabela(dados) {
        corpoTabela.innerHTML = '';
        if (dados.length === 0) {
            corpoTabela.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">Nenhum lançamento encontrado.</td></tr>';
            return;
        }

        dados.forEach(lanc => {
            const dataFormatada = new Date(lanc.data_lancamento).toLocaleDateString('pt-BR');
            const valorFormatado = Number(lanc.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            const classeCor = lanc.tipo_lancamento === 'RECEITA' ? 'receita' : 'despesa';
            
            corpoTabela.innerHTML += `
                <tr>
                    <td>${lanc.id}</td>
                    <td>${lanc.descricao}</td>
                    <td>${dataFormatada}</td>
                    <td class="${classeCor}">${valorFormatado}</td>
                    <td>${lanc.tipo_lancamento}</td>
                    <td>${lanc.situacao}</td>
                    <td>
                        <button class="btn-acao btn-editar" onclick="editarLancamento(${lanc.id})">Editar</button>
                        <button class="btn-acao btn-excluir" onclick="excluirLancamento(${lanc.id})">Excluir</button>
                    </td>
                </tr>
            `;
        });
    }

    function aplicarFiltros() {
        const textoDescricao = filtroDescricao.value.toLowerCase();
        const dataSelecionada = filtroData.value;
        const tipoSelecionado = filtroTipo.value;
        const situacaoSelecionada = filtroSituacao.value;

        dadosAtuaisFiltrados = todosLancamentos.filter(lanc => {
            const dataLancamentoYYYYMMDD = new Date(lanc.data_lancamento).toISOString().split('T')[0];
            const matchDescricao = lanc.descricao.toLowerCase().includes(textoDescricao);
            const matchData = dataSelecionada === '' || dataLancamentoYYYYMMDD === dataSelecionada;
            const matchTipo = tipoSelecionado === '' || lanc.tipo_lancamento === tipoSelecionado;
            const matchSituacao = situacaoSelecionada === '' || lanc.situacao === situacaoSelecionada;

            return matchDescricao && matchData && matchTipo && matchSituacao;
        });

        renderizarTabela(dadosAtuaisFiltrados);
    }

    filtroDescricao.addEventListener('input', aplicarFiltros);
    filtroData.addEventListener('input', aplicarFiltros);
    filtroTipo.addEventListener('change', aplicarFiltros);
    filtroSituacao.addEventListener('change', aplicarFiltros);

    btnLimpar.addEventListener('click', () => {
        filtroDescricao.value = '';
        filtroData.value = '';
        filtroTipo.value = '';
        filtroSituacao.value = '';
        aplicarFiltros();
    });

    function gerarPDF(dados, titulo) {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.text(titulo, 14, 15);
        
        const colunas = [["ID", "Descrição", "Data", "Valor", "Tipo", "Situação"]];
        const linhas = dados.map(lanc => [
            lanc.id,
            lanc.descricao,
            new Date(lanc.data_lancamento).toLocaleDateString('pt-BR'),
            Number(lanc.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            lanc.tipo_lancamento,
            lanc.situacao
        ]);

        doc.autoTable({
            startY: 20,
            head: colunas,
            body: linhas,
            theme: 'striped',
            headStyles: { fillColor: [33, 150, 243] }
        });

        doc.save(`${titulo.replace(/ /g, '_')}.pdf`);
    }

    document.getElementById('btn-exportar-todos').addEventListener('click', () => {
        gerarPDF(todosLancamentos, 'Relatorio Completo');
    });

    document.getElementById('btn-exportar-filtrados').addEventListener('click', () => {
        const textoDescricao = filtroDescricao.value.trim();
        const dataSelecionada = filtroData.value;
        const tipoSelecionado = filtroTipo.value;
        const situacaoSelecionada = filtroSituacao.value;

        if (!textoDescricao && !dataSelecionada && !tipoSelecionado && !situacaoSelecionada) {
            alert('Você precisa aplicar pelo menos um filtro antes de baixar o relatório filtrado.');
            return;
        }

        gerarPDF(dadosAtuaisFiltrados, 'Relatorio_Filtrado');
    });

    // ---- Lógica de Envio de E-mail ----
    async function enviarPDFEmail(dados, titulo, comFiltros = false) {
        const destino = prompt('Para qual e-mail deseja enviar o relatório?');
        if (!destino) return; // cancelou

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        doc.text(titulo, 14, 15);
        const colunas = [["ID", "Descrição", "Data", "Valor", "Tipo", "Situação"]];
        const linhas = dados.map(lanc => [
            lanc.id,
            lanc.descricao,
            new Date(lanc.data_lancamento).toLocaleDateString('pt-BR'),
            Number(lanc.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
            lanc.tipo_lancamento,
            lanc.situacao
        ]);

        doc.autoTable({ startY: 20, head: colunas, body: linhas, theme: 'striped', headStyles: { fillColor: [33, 150, 243] }});

        const pdfDataUri = doc.output('datauristring');
        
        alert('Enviando o e-mail no background... aguarde (não feche a página).');
        
        try {
            const resp = await fetch('/api/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pdfBase64: pdfDataUri, emailDestino: destino, assunto: titulo, comFiltros })
            });

            if (resp.ok) {
                const result = await resp.json();
                alert(result.message || 'E-mail enviado com sucesso para o destinatário!');
            } else {
                alert('Falha interna ao tentar processar o e-mail.');
            }
        } catch (err) {
            console.error(err);
            alert('Erro de comunicação com a API de e-mail.');
        }
    }

    document.getElementById('btn-email-todos').addEventListener('click', () => {
        enviarPDFEmail(todosLancamentos, 'Relatorio Financeiro Completo', false);
    });

    document.getElementById('btn-email-filtrados').addEventListener('click', () => {
        const textoDescricao = filtroDescricao.value.trim();
        const dataSelecionada = filtroData.value;
        const tipoSelecionado = filtroTipo.value;
        const situacaoSelecionada = filtroSituacao.value;

        if (!textoDescricao && !dataSelecionada && !tipoSelecionado && !situacaoSelecionada) {
            alert('Você precisa aplicar pelo menos um filtro antes de enviar o relatório filtrado.');
            return;
        }
        enviarPDFEmail(dadosAtuaisFiltrados, 'Relatorio Financeiro Filtrado', true);
    });

    // ---- Lógica do Modal CRUD ----
    function fecharModal() {
        modalLancamento.style.display = 'none';
        formLancamento.reset();
        document.getElementById('form-id').value = '';
    }

    btnAbrirModal.addEventListener('click', () => {
        fecharModal();
        modalTitulo.textContent = 'Novo Lançamento';
        modalLancamento.style.display = 'flex';
    });

    btnFecharModal.addEventListener('click', fecharModal);

    window.editarLancamento = (id) => {
        const lanc = todosLancamentos.find(l => l.id === id);
        if (!lanc) return;
        
        modalTitulo.textContent = 'Editar Lançamento';
        document.getElementById('form-id').value = lanc.id;
        document.getElementById('form-descricao').value = lanc.descricao;
        document.getElementById('form-data').value = new Date(lanc.data_lancamento).toISOString().split('T')[0];
        document.getElementById('form-valor').value = lanc.valor;
        document.getElementById('form-tipo').value = lanc.tipo_lancamento;
        document.getElementById('form-situacao').value = lanc.situacao;
        
        modalLancamento.style.display = 'flex';
    };

    window.excluirLancamento = async (id) => {
        if (!confirm('Você tem certeza que deseja excluir permanentemente este lançamento?')) return;
        
        try {
            const resp = await fetch(`/api/lancamentos/${id}`, { method: 'DELETE' });
            if(resp.ok) carregarDados();
            else alert('Falha ao excluir o registro.');
        } catch(err) {
            console.error('Erro na deleção', err);
            alert('Erro interno ao excluir lançamento.');
        }
    };

    formLancamento.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('form-id').value;
        const payload = {
            descricao: document.getElementById('form-descricao').value,
            data_lancamento: document.getElementById('form-data').value,
            valor: parseFloat(document.getElementById('form-valor').value),
            tipo_lancamento: document.getElementById('form-tipo').value,
            situacao: document.getElementById('form-situacao').value,
        };

        const isUpdate = !!id;
        const method = isUpdate ? 'PUT' : 'POST';
        const url = isUpdate ? `/api/lancamentos/${id}` : '/api/lancamentos';

        try {
            const resp = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                fecharModal();
                carregarDados();
            } else {
                alert('Falha ao salvar o lançamento.');
            }
        } catch(err) {
            console.error('Erro no salvamento', err);
            alert('Erro interno ao salvar lançamento.');
        }
    });

    // Iniciar
    carregarDados();
});
