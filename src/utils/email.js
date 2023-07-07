require('dotenv').config();
const ElasticEmail = require('elasticemail');

const elasticemail = new ElasticEmail({
  apiKey: process.env.API_EMAIL,
});


const enviarCorreoElectronico=async(destinatarios, evento)=> {
    const mensaje = {
      from: 'RockTheBarrio@gmail.com', 
      to: 'RockTheBarrio@gmail.com', 
      bcc: destinatarios, 
      subject: 'Nuevo evento musical',
      text: `¡Hola! Se ha añadido un nuevo evento musical: ${evento.title}. No te lo pierdas.`,
    };
  
  
  try {
    const respuesta = await elasticemail.send(mensaje);
    console.log('Correo electrónico enviado:', respuesta);
  } catch (error) {
    console.error('Error al enviar el correo electrónico:', error);
  }
}

module.exports = enviarCorreoElectronico;
