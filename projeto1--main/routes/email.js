const express = require('express');
const router = express.Router();
const { Resend } = require('resend');

// Inicializa o Resend com a chave do .env
const resend = new Resend(process.env.RESEND_API_KEY);

// IMPORTANTE: No plano gratuito do Resend (domínio onboarding@resend.dev),
// só é possível enviar e-mails para o e-mail da própria conta.
const EMAIL_PADRAO = 'luiz.panis@universo.univates.br';

router.post('/', async (req, res) => {
    const { pdfBase64, emailDestino, assunto } = req.body;

    if (!pdfBase64) return res.status(400).send('Arquivo PDF é obrigatório');

    try {
        const base64Data = pdfBase64.includes('base64,') ? pdfBase64.split('base64,')[1] : pdfBase64;
        const buffer = Buffer.from(base64Data, 'base64');

        // Disparo via Resend usando HTML e Anexo
        const { data, error } = await resend.emails.send({
            from: 'Relatorios <onboarding@resend.dev>',
            to: emailDestino || EMAIL_PADRAO,
            subject: assunto || 'Relatório Financeiro',
            html: `
                <div style="font-family: sans-serif; color: #333;">
                    <h2>Seu Relatório Financeiro</h2>
                    <p>Olá! Conforme solicitado, segue em anexo o relatório exportado do <strong>Sistema de Finanças</strong>.</p>
                    <p>O arquivo está no formato PDF.</p>
                    <br>
                    <hr>
                    <p style="font-size: 0.8em; color: #777;">Este é um e-mail automático, por favor não responda.</p>
                </div>
            `,
            attachments: [
                {
                    filename: 'relatorio.pdf',
                    content: buffer,
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
