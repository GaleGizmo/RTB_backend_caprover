require('dotenv').config();
const nodemailer = require('nodemailer');

const enviarCorreoElectronico = async (destinatarios, evento) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.elasticemail.com',
    port: 587,
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mensaje = {
    from: 'rockthebarrio@gmail.com',
    to: 'rockthebarrio@gmail.com',
    bcc: destinatarios,
    subject: 'Novo evento musical',
    html: `<p>Ola! Engadiuse un novo evento musical: ${evento.title}.</p>
    <p>Máis información  <a href="https://rock-the-barrio-front-one.vercel.app/"> aquí.</a></p>`,
  };

  try {
    const respuesta = await transporter.sendMail(mensaje);
    console.log('Correo electrónico enviado:', respuesta);
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
  }
};

module.exports = enviarCorreoElectronico;
