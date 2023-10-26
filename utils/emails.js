const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth: {
        user: "thuamwangi001@gmail.com",
        pass: "npkp blhb jmak eevc",
    }
})

let sendEmail = async (email, subject, message, from="thuamwangi001@gmail.com") => {
    let mailOptions = {
        from: from,
        to: email,
        subject: subject,
        html: message
    }
    try {
        await transporter.sendMail(mailOptions)
    }catch (e) {
        console.error("Failed to send email ",e)
    }
}

module.exports = sendEmail