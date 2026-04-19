const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// Configura o transporte SMTP do Gmail (gratuito, até ~500 emails/dia)
// Usa variáveis de ambiente para segurança
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,     // seu email Gmail completo
        pass: process.env.GMAIL_APP_PASS, // senha de app gerada no Google
    },
});

router.post('/', async (req, res) => {
    const { pdfBase64, emailDestino, assunto, comFiltros, nomeRemetente } = req.body;

    if (!pdfBase64) return res.status(400).send('Arquivo PDF é obrigatório');
    if (!emailDestino) return res.status(400).send('E-mail de destino é obrigatório');

    try {
        const base64Data = pdfBase64.includes('base64,') ? pdfBase64.split('base64,')[1] : pdfBase64;

        // Monta título e mensagem de acordo com o tipo de relatório
        const tituloEmail = comFiltros
            ? 'Relatório Financeiro Filtrado'
            : 'Relatório Financeiro Completo';

        const mensagemCorpo = comFiltros
            ? 'Seu relatório financeiro <strong>com filtros</strong> está disponível.'
            : 'Seu relatório financeiro <strong>completo</strong> está disponível.';

        // Suporta múltiplos destinatários separados por vírgula
        // Ex: "email1@gmail.com, email2@outlook.com, email3@yahoo.com"
        const destinatarios = emailDestino
            .split(',')
            .map(e => e.trim())
            .filter(e => e.length > 0);

        if (destinatarios.length === 0) {
            return res.status(400).send('Nenhum e-mail de destino válido');
        }

        const mailOptions = {
            from: `${nomeRemetente || 'Relatórios Financeiros'} <${process.env.GMAIL_USER}>`,
            to: destinatarios.join(', '), // vários destinatários separados por vírgula
            subject: assunto || tituloEmail,
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background: linear-gradient(135deg, #2196F3, #1976D2); padding: 20px; border-radius: 8px 8px 0 0;">
                        <h2 style="color: white; margin: 0;">📊 ${tituloEmail}</h2>
                    </div>
                    <div style="padding: 20px; background: #f9f9f9; border: 1px solid #e0e0e0;">
                        <p>Olá! ${mensagemCorpo}</p>
                        <p>Confira o arquivo em anexo no formato PDF.</p>
                    </div>
                    <div style="padding: 10px 20px; background: #eee; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none;">
                        <p style="font-size: 0.8em; color: #777; margin: 0;">Este é um e-mail automático, por favor não responda.</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: 'relatorio.pdf',
                    content: Buffer.from(base64Data, 'base64'),
                    contentType: 'application/pdf',
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);

        res.json({
            message: `E-mail enviado com sucesso para ${destinatarios.length} destinatário(s)!`,
            messageId: info.messageId,
            destinatarios: destinatarios,
        });
    } catch (err) {
        console.error('Erro ao enviar e-mail:', err);

        // Mensagens de erro amigáveis para problemas comuns
        if (err.code === 'EAUTH') {
            return res.status(500).json({
                error: 'Falha na autenticação do Gmail. Verifique GMAIL_USER e GMAIL_APP_PASS no .env'
            });
        }

        res.status(500).send('Erro interno ao tentar enviar o e-mail');
    }
});

module.exports = router;
