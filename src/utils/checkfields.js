
function checkEventMandatoryFields(body) {
const requiredFields = [
    "title",
    "subtitle",
    "content",
    "user_creator",
    "site",
    "price",
    "date_start",
  ];
  const missingFields = requiredFields.filter((field) => !body[field]);

  // if (missingFields.length > 0) {
  //   return false;
  
  // } else return true
  return missingFields.length === 0 
}

module.exports = {checkEventMandatoryFields}