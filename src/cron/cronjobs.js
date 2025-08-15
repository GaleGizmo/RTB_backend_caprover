// src/cron/cronjobs.js (o donde prefieras)
const { CronJob } = require('cron');
const { remindEvento, sendEventosSemanales } = require('../api/evento/evento.controller');
const { festivalDesactivado } = require('../api/festival/festival.controller');



function startCronJobs() {
  // Tarea semanal: lunes a las 16:00 (hora Madrid)
  const eventosSemanalesJob = new CronJob(
    '00 16 * * 1',
    () => {
      sendEventosSemanales()
        .then(() => {
          console.log("sendEventosSemanales ejecutado con éxito.");
        })
        .catch((error) => {
          console.error("Error al ejecutar sendEventosSemanales:", error);
        });
    },
    null,
    true,
    'Europe/Madrid'
  );


  // Recordatorio diario: todos los días a las 10:00 (hora Madrid)
  const recordatorioEventoJob = new CronJob(
    '0 10 * * *',
    () => {
      remindEvento()
        .then(() => {
          console.log("remindEvento ejecutado con éxito.");
        })
        .catch((error) => {
          console.error("Error al ejecutar remindEvento:", error);
        });
    },
    null,
    true,
    'Europe/Madrid'
  );

  // Comprueba si hay que desactivar algún festival porque ya ha pasado la fecha de todos sus eventos
  const festivalDesactivadoJob = new CronJob(
    '0 01 * * *',
    () => {
      festivalDesactivado()
        .then(() => {
          console.log("festivalDesactivado ejecutado con éxito.");
        })
        .catch((error) => {
          console.error("Error al ejecutar festivalDesactivado:", error);
        });
    },
    null,
    true,
    'Europe/Madrid'
  );

  console.log("Tareas cron inicializadas.");
}

module.exports = { startCronJobs };
