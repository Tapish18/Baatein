const bcrypt = require("bcrypt");

const createHashedPassword = async (password) => {
  let salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
  let hashedPassword = await bcrypt.hash(password, salt);

  return hashedPassword;
};

module.exports = {
  createHashedPassword,
};
