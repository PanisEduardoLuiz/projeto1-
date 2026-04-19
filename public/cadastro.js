// Aplica o tema salvo antes de carregar o resto
const temaSalvo = localStorage.getItem('theme');
if (temaSalvo === 'dark') document.body.setAttribute('data-theme', 'dark');

document.getElementById('cadastro-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const msgErro = document.getElementById('mensagem-erro');
    const msgSucesso = document.getElementById('mensagem-sucesso');

    // Limpa mensagens anteriores
    msgErro.textContent = '';
    msgSucesso.textContent = '';

    fetch('/api/usuarios/cadastro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
    })
    .then(response => response.json())
    .then(dados => {
        if (dados.sucesso) {
            msgSucesso.textContent = dados.mensagem + ' Redirecionando...';
            // Redireciona para o login após 2 segundos
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } else {
            msgErro.textContent = dados.mensagem;
        }
    })
    .catch(erro => {
        console.error('Erro no cadastro:', erro);
        msgErro.textContent = 'Erro ao conectar ao servidor.';
    });
});
