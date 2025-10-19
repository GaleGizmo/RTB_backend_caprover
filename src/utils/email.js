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

  const { token: accessToken } = await oAuth2Client.getAccessToken();
  oAuth2Client.setCredentials({ access_token: accessToken });

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
const enviarCorreoEventos = async (destinatario, eventos, semanal) => {
  try {
    const transporter = await createTransporter();
    let eventosHTML = "";
    for (const evento of eventos) {
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
      const lugar = evento.site;
        

      eventosHTML += `
       <div style="font-family: Arial, sans-serif; margin: 10px auto ; width:70%;  border: 2px solid #000; border-radius: 10px; padding: 10px 20px; background-image:linear-gradient(to bottom, #f16704, #fff);  ">
        <h2>${evento.title}</h2>
        <span>Artista: </span><h3 style="display: inline;">${evento.artist}</h3>
        <p>Data: día <strong>${dia}</strong> de <strong>${nombreMes}</strong></p>
        <p>Lugar:<strong> ${lugar}</strong></p>
        <p>Máis detalles <a href="https://www.rockthebarrio.es/${evento._id}"> aquí</a></p>
        </div>
        <br/>
      `;
    }
    let tipoEventos = "";
    let unsubscribe = "";
    let emailSubject = "";
    let avisoSemanal = "";
    if (semanal) {
      tipoEventos = "<h1><u>EVENTOS SEMANAIS</u></h1>";
      unsubscribe = "unsubscribenewsletter";
      emailSubject = "Eventos da semana";
      avisoSemanal =
        "<p style='display: inline; font-size: 14px; font-weight:700; color: red;'>ACLARACIÓN: </p><p style='display: inline; font-size: 14px; font-weight: 600; color: black;'> Dada a escasa marxe de tempo con que algúns locais publicitan os seus concertos, este email non contén todos (ainda que si a maioría) os eventos musicais da semana. Para asegurarte de non perder nada, aconsellámoste que marques a casiña 'Email con novos eventos' no teu perfil, ou ben que visites a nosa web regularmente.</p> <p></p> <p></p>";
    } else {
      tipoEventos = "<h2><u>Últimos eventos engadidos</u></h2>";
      unsubscribe = "unsubscribenewevent";
      emailSubject = "Novos eventos";
      avisoSemanal = "<p></p>";
    }
    const contenido = `
     <div style="display: block; width: 100%; text-align:center;"> <p>Ola, ${destinatario.username}!</p>
      ${tipoEventos}
      ${eventosHTML}
      <p></p>
      ${avisoSemanal}
      <p style="font-size: 10px; color: #555;">Para deixar de recibir este correo preme <a href="https://www.rockthebarrio.es/reset-password/${unsubscribe}"> aquí</a>.</p>
      <p style="font-size: 10px; color: #555;">Podes ver aquí os <a href="https://www.rockthebarrio.es/terminos"> Termos e Condicións </a> e a nosa <a href="https://www.rockthebarrio.es/privacidad"> Política de Privacidade</a>.</p>
      </div>`;

    const mensaje = {
      from: " Rock The Barrio <rockthebarrio@gmail.com>",
      to: destinatario.email,
      subject: emailSubject,
      html: contenido,
    };
    const respuesta = await transporter.sendMail(mensaje);
  } catch (error) {
    console.error(
      "Error al enviar el correo electrónico a:",
      destinatario.email,
      error.response
    );
    throw new Error("No se pudo enviar el correo electrónico.");
  }
};

const enviarReminderEventos = async (evento, usuario) => {
  try {
    const transporter = await createTransporter();
    const dia = evento.date_start.getDate();
    const lugar = evento.site;
    const mensaje = {
      from: " Rock The Barrio <rockthebarrio@gmail.com>",
      to: usuario.email,
      subject: "Recordatorio de evento",
      html: `<div style="display: block; width: 100%; text-align:center;">
      <p>Ola, ${usuario.username},</p>
             <p>Un evento que tes engadido en favoritos está próximo a se celebrar:</p>
             <div style="font-family: Arial, sans-serif; margin: 10px auto ; width:70%;  border: 2px solid #000; border-radius: 10px; padding: 10px 20px; background-image:linear-gradient(to bottom, #f16704, #fff);  ">
        <h2>${evento.title}</h2>
        <span>Artista: </span><h3 style="display: inline;">${evento.artist}</h3>
        <p>Data: día <strong>${dia}</strong></p>
        <p>Lugar:<strong> ${lugar}</strong></p>
        <p>Máis detalles <a href="https://www.rockthebarrio.es/${evento._id}"> aquí</a></p>
        </div>
        <br/>
        </div>`,
    };

    const respuesta = await transporter.sendMail(mensaje);
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
  }
};

const enviarCorreoRecuperacion = async (destinatario, token) => {
  try {
    const transporter = await createTransporter();

    const mensaje = {
      from: " Rock The Barrio <rockthebarrio@gmail.com>",
      to: destinatario.email,
      subject: "Recuperación de contrasinal",
      html: `<p>Ola, ${destinatario.username},</p>
             <p>Semella que solicitaches restablecer o teu contrasinal na nosa aplicación.</p>
             <p>Clica no seguinte enlace, ou copiao e pégao no teu navegador, para cambia-lo teu contrasinal:</p>
             <a href="https://www.rockthebarrio.es/reset-password/${token}">Restablecer contrasinal</a>
             <span>(Este enlace caduca en 60 minutos)</span>
             <p>Se non solicitaches restablece-lo teu contrasinal, borra por favor este correo.</p>
             <p>Grazas,</p>
             <p>Rock The Barrio</p></p>`,
    };

    const respuesta = await transporter.sendMail(mensaje);
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
  }
};
const enviarCorreccionEvento = async (user, evento, mensaje, asunto) => {
  try {
    const transporter = await createTransporter();
    const contenido = `
     <div style="display: block; width: 100%; text-align:center;"> <p>Ola, ${user.username}!</p>
     <p>Por favor, toma nota da seguinte corrección:</p>
     <p>Evento: <a href="https://www.rockthebarrio.es/${evento._id}"> ${evento.title}</a></p>
      <p>Corrección: ${mensaje}</p>
      <p></p>
      <p style="font-size: 10px; color: #555;">Podes ver aquí os <a href="https://www.rockthebarrio.es/terminos"> Termos e Condicións </a> e a nosa <a href="https://www.rockthebarrio.es/privacidad"> Política de Privacidade</a>.</p>
      </div>`;
    const email = {
      from: " Rock The Barrio <rockthebarrio@gmail.com>",
      to: user.email,
      subject: asunto,
      html: contenido,
    };
    const respuesta = await transporter.sendMail(email);
    console.log("Correo electrónico enviado:", respuesta);
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    throw new Error("No se pudo enviar el correo electrónico.");
  }
};
const enviarMensajeDeUsuario = async (
  asunto,
  nombreDeUsuario,
  emailDeUsuario = "N/A",
  mensaje
) => {
  try {
    const transporter = await createTransporter();

    const contenido = `
     <div style="display: block; width: 100%; text-align:center;"> <p>Ola, xefe!</p>
     <p>Tes unha mensaxe de ${nombreDeUsuario}:</p>
      <p>${mensaje}</p>
      <p></p>
      <Correo de resposta: ${emailDeUsuario}>
      </div>`;
    const subject = `Mensaxe de ${nombreDeUsuario}: ${asunto}`;
    const email = {
      from: " Rock The Barrio <rockthebarrio@gmail.com>",
      to: "rockthebarrio@gmail.com",
      subject: subject,
      html: contenido,
    };
    const respuesta = await transporter.sendMail(email);
  } catch (error) {
    console.error("Error al enviar el correo electrónico:", error);
    throw new Error("No se pudo enviar el correo electrónico.");
  }
};
module.exports = {
  enviarCorreoEventos,
  enviarCorreoRecuperacion,
  enviarReminderEventos,
  enviarCorreccionEvento,
  enviarMensajeDeUsuario,
};
