document.getElementById('login-form').addEventListener('submit', function(e) {
    // Previne que a página recarregue ao enviar o formulário
    e.preventDefault();

    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    const msgErro = document.getElementById('mensagem-erro');

    // Limpa mensagem de erro anterior
    msgErro.textContent = '';

    // Envia os dados para a API do Back-end conferir
    fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuario, senha })
    })
    .then(response => response.json())
    .then(dados => {
        if (dados.sucesso) {
            // Login deu certo! Redireciona para a tela de listagem
            window.location.href = 'lancamentos.html';
        } else {
            // Login falhou! Mostra a mensagem vinda do servidor
            msgErro.textContent = dados.mensagem;
        }
    })
    .catch(erro => {
        console.error('Erro no login:', erro);
        msgErro.textContent = 'Erro ao conectar ao servidor.';
    });
});
