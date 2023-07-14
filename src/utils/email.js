require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");

const createTransporter = async () => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  const accessToken = await oAuth2Client.getAccessToken();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: "rockthebarrio@gmail.com",
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken,
    },
  });

  return transporter;
};
const enviarCorreoSemanal = async (destinatario, eventos) => {
  try {
    const transporter = await createTransporter();
    let contenido = `<p>Ola, ${destinatario.username}!</p> <p></p> <h1><u>EVENTOS SEMANAIS</u></h1>`;

    for (const evento of eventos) {
      const dia = evento.date_start.getDate();
      contenido += `<h2>${evento.title}</h2>`;
      contenido += `<p>Data: día <strong>${dia}</strong></p>`;
      contenido += `<p>Lugar:<strong> ${evento.site}</strong></p>`;
      contenido += `<p></p>`;
    }
    contenido += `<p>Máis detalles <a href="https://rock-the-barrio-front-one.vercel.app/"> aquí</a>  </p>`;
    const mensaje = {
      from: "rockthebarrio@gmail.com",
      to: destinatario.email,
      subject: "Eventos da semana",
      html: contenido,
    };
    const respuesta = await transporter.sendMail(mensaje);
    console.log("Correo electrónico enviado:", respuesta);
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
  }
};
const enviarCorreoElectronico = async (destinatario, evento) => {
  try {
    const transporter = await createTransporter();

    const dia = evento.date_start.getDate();
    const mes = evento.date_start.getMonth();
    const mesesEnGallego = [
      "Xaneiro",
      "Febreiro",
      "Marzo",
      "Abril",
      "Maio",
      "Xuño",
      "Xullo",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Decembro",
    ];

    const nombreMes = mesesEnGallego[mes];

    const mensaje = {
      from: "rockthebarrio@gmail.com",
      to: destinatario.email,
      subject: "Novo evento musical",
      html: `<p>Ola, ${destinatario.username}! Engadiuse un novo evento musical:<strong> ${evento.title}</strong> o día <strong>${dia}</strong> de<strong> ${nombreMes}</strong>.</p>
        <p>Máis información  <a href="https://rock-the-barrio-front-one.vercel.app"> aquí.</a></p>`,
    };

    const respuesta = await transporter.sendMail(mensaje);
    console.log("Correo electrónico enviado:", respuesta);
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
  }
};
const enviarCorreoRecuperacion = async (destinatario, token) => {
  try {
    const transporter = await createTransporter();

    const mensaje = {
      from: "rockthebarrio@gmail.com",
      to: destinatario.email,
      subject: "Recuperación de contrasinal",
      html: `<p>Ola, ${destinatario.username},</p>
             <p>Solicitaches restablecer o teu contrasinal na nosa aplicación.</p>
             <p>Clica no seguinte enlace para cambia-lo teu  contrasinal:</p>
             <a href="https://rock-the-barrio-front-one.vercel.app/reset-password/${token}">Restablecer contrasinal</a>
             <p>Se non solicitaches restablece-lo teu contrasinal, ignora este correo.</p>
             <p>Grazas,</p>
             <p>Rock The Barrio</p></p>`,
    };

    const respuesta = await transporter.sendMail(mensaje);
    console.log("Correo electrónico enviado:", respuesta);
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
  }
};
module.exports = { enviarCorreoElectronico, enviarCorreoSemanal, enviarCorreoRecuperacion };
