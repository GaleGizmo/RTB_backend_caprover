
function checkMandatoryFields(req, res, next) {
const requiredFields = [
    "title",
    "subtitle",
    "content",
    "user_creator",
    "site",
    "price",
    "date_start",
  ];
  const missingFields = requiredFields.filter((field) => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: `Faltan campos obligatorios: ${missingFields.join(", ")}`,
    });
  }
}

module.exports = {checkMandatoryFields}