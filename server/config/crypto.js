const crypto = require("crypto");
const algorithm = "aes-256-cbc";
const key = crypto.scryptSync(process.env.JWT_SECRET, "salt", 32); // Use a salt and derive a key

const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

const decrypt = (hash) => {
  const parts = hash.split(":");
  const iv = Buffer.from(parts.shift(), "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ]);
  return decrypted.toString();
};

module.exports = { encrypt, decrypt };
