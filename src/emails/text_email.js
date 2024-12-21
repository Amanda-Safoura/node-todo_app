const nodemailer = require('nodemailer')

module.exports = (recipient_email, subject, content) => {

    // Configurer le transporteur d'email
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_MAIL,
            pass: process.env.GMAIL_PASSWORD
        }
    })

    // Définir les options de l'email
    let mailOptions = {
        from: process.env.GMAIL_MAIL,
        to: `${recipient_email}`,
        subject: `${subject}`,
        text: `${content}`,
    }

    // Envoyer l'email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error)
        }
        console.log('Email envoyé : ' + info.response)
    })
}
