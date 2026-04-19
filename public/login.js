// Aplica o tema salvo antes de carregar o resto
const temaSalvo = localStorage.getItem('theme');
if (temaSalvo === 'dark') document.body.setAttribute('data-theme', 'dark');

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const msgErro = document.getElementById('mensagem-erro');

    // Limpa mensagem de erro anterior
    msgErro.textContent = '';

    fetch('/api/usuarios/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha })
    })
    .then(response => response.json())
    .then(dados => {
        if (dados.sucesso) {
            // Salva os dados do usuário no localStorage
            localStorage.setItem('usuario', JSON.stringify(dados.usuario));
            // Redireciona para a tela de listagem
            window.location.href = 'lancamentos.html';
        } else {
            msgErro.textContent = dados.mensagem;
        }
    })
    .catch(erro => {
        console.error('Erro no login:', erro);
        msgErro.textContent = 'Erro ao conectar ao servidor.';
    });
});
