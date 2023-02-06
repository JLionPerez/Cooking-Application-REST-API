const jwt = require("jsonwebtoken");

const secretKey = "SuperSecret";

const { getUserById } = require("../models/user");

async function generateAuthToken(userId) {
  const user = await getUserById(userId);
  const payload = { sub: userId, admin: user.admin };
  return jwt.sign(payload, secretKey, { expiresIn: "24h" });
}
exports.generateAuthToken = generateAuthToken;

function requireAuthentication(req, res, next) {
  const authHeader = req.get("Authorization") || "";
  const authHeaderParts = authHeader.split(" ");
  const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;

  try {
    const payload = jwt.verify(token, secretKey);
    req.user = payload.sub;
    req.admin = payload.admin;

    console.log("== req.user: ", req.user);

    next();
  } catch (err) {
    res.status(401).send({
      error: "Invalid authentication token.",
    });
  }
}
exports.requireAuthentication = requireAuthentication;

function checkIfAdmin(req, res, next) {
  /*
   * Authorization: Bearer <token>
   */
  const authHeader = req.get("Authorization") || "";
  const authHeaderParts = authHeader.split(" ");
  const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : null;

  try {
    const payload = jwt.verify(token, secretKey);
    req.admin = payload.admin;
  } catch (err) {
    console.log("==err", err);
    req.admin = 0;
  }

  next();
}
exports.checkIfAdmin = checkIfAdmin;
