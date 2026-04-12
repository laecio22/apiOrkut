
const jwt = require("jsonwebtoken");
const auth = (req, res, next) => {
  const token = req.headers.authorization;
  console.log(req.headers.authorization);

  if (!token) {
    return res.status(401).json({
      mensagem: "Sem token",
    });
  }

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_KEY_SECRET);
    req.usuario = decoded;
    console.log(req.usuario);
    next();
    console.log("AUTH SECRET", process.env.JWT_KEY_SECRET);
    console.log("token", token);
  } catch (error) {
    console.log("erro", error.message);
    return res.status(401).json({
      mensagem: "Token  inválido",
    });
  }
};

module.exports =  auth;
