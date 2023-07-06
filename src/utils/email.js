const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'Gmail', 
  auth: {
    user: 'rockthebarrio@gmail.com',
    pass: process.env.EMAIL_SECRET
  },
});
function enviarCorreoElectronico(destinatarios, evento) {
    const mensaje = {
      from: 'rockthebarrio@gmail.com', 
      to: 'rockthebarrio@gmail.com', 
      bcc: destinatarios, 
      subject: 'Nuevo evento musical',
      text: `¡Hola! Se ha añadido un nuevo evento musical: ${evento.title}. No te lo pierdas.`,
    };
  
    transporter.sendMail(mensaje, (error, info) => {
      if (error) {
        console.log('Error al enviar el correo electrónico:', error);
      } else {
        console.log('Correo electrónico enviado:', info.response);
      }
    });
  }

module.exports = enviarCorreoElectronico;
