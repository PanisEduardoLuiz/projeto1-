const nodemailer = require('nodemailer');
async function run() {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 2525, // bypass standard blocks
        secure: false, 
        auth: {
            user: testAccount.user,
            pass: testAccount.pass
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000
    });

    transporter.verify(function(error, success) {
        if (error) {
            console.log('Connection error:', error);
        } else {
            console.log('Successfully connected on port 2525');
        }
        process.exit();
    });
}
run();
