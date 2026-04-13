const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

// Inicializa o Resend com a chave do .env
const resend = new Resend(process.env.RESEND_API_KEY);

// IMPORTANTE: No plano gratuito do Resend (domínio onboarding@resend.dev),
// só é possível enviar e-mails para o e-mail da própria conta.
const EMAIL_PADRAO = 'luiz.panis@universo.univates.br';

router.post('/', async (req, res) => {
    const { pdfBase64, emailDestino, assunto, comFiltros } = req.body;

    if (!pdfBase64) return res.status(400).send('Arquivo PDF é obrigatório');

    try {
        const base64Data = pdfBase64.includes('base64,') ? pdfBase64.split('base64,')[1] : pdfBase64;

        // Monta título e mensagem de acordo com o tipo de relatório
        const tituloEmail = comFiltros
            ? 'Relatório Financeiro Filtrado'
            : 'Relatório Financeiro Completo';

        const mensagemCorpo = comFiltros
            ? 'Seu relatório financeiro <strong>com filtros</strong> está disponível.'
            : 'Seu relatório financeiro <strong>completo</strong> está disponível.';

        const { data, error } = await resend.emails.send({
            from: 'Relatorios <onboarding@resend.dev>',
            to: emailDestino || EMAIL_PADRAO,
            subject: assunto || tituloEmail,
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>${tituloEmail}</h2>
                    <p>Olá! ${mensagemCorpo}</p>
                    <p>Confira o arquivo em anexo no formato PDF.</p>
                    <br>
                    <hr>
                    <p style="font-size: 0.8em; color: #777;">Este é um e-mail automático, por favor não responda.</p>
                </div>
            `,
            attachments: [
                {
                    filename: 'relatorio.pdf',
                    content: Buffer.from(base64Data, 'base64'),
                    contentType: 'application/pdf',
                }
            ]
        });

        if (error) {
            console.error('Erro no Resend:', error);
            return res.status(500).json({ error: 'Falha ao enviar e-mail via Resend' });
        }

        res.json({
            message: 'E-mail enviado com sucesso diretamente para sua caixa de entrada!',
            resendId: data.id
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro interno ao tentar processar o e-mail');
    }
});

module.exports = router;
