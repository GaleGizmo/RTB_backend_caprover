require("dotenv").config();
const nodemailer = require("nodemailer");
const {google}=require("googleapis")

const enviarCorreoElectronico = async (destinatario, evento) => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  try {
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

// const transporter = nodemailer.createTransport({
//   host: "smtp.elasticemail.com",
//   port: 587,
//   auth: {
//     user: process.env.SMTP_USERNAME,
//     pass: process.env.SMTP_PASSWORD,
//   },
// });
// const enviarCorreoElectronico = async (destinatario, evento) => {
  

//   const mensaje = {
//     from: "rockthebarrio@gmail.com",
//     to: destinatario,
//     subject: "Novo evento musical",
//     html: `<p>Ola! Engadiuse un novo evento musical: ${evento.title}.</p>
//     <p>Máis información  <a href="https://rock-the-barrio-front-one.vercel.app/"> aquí.</a></p>`,
//   };

//   try {
//     const respuesta = await transporter.sendMail(mensaje);
//     console.log("Correo electrónico enviado:", respuesta);
//   } catch (error) {
//     console.error("Error al enviar el correo electrónico:", error);
//   }
// };

module.exports = enviarCorreoElectronico;
