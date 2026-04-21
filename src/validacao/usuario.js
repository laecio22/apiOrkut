const Joi = require("joi");

const usuarioSchema = Joi.object({
  nome: Joi.string().min(3).max(40).required().messages({
    "string.base": "O nome  não   pode  ser em formato de  número",
    "string.min": "O nome  deve  ter  no  minímo 3  caracteres",
    "string.max": "O nome  deve  ter no máximo  40  caracteres",
    "string.empty": "O nome  não  pode  ser  vazio",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "O email  deve  estar  em formato de  string",
    "string.email": "Deve  informar  um email válido",
    "string.empty": "O email  não  pode  ser  vazio",
  }),
  senha: Joi.string().min(6).required().messages({
    "string.base": "A  senha  deve estar  formato  string",
    "string.min": "A  senha  deve ter  no mínimo  6  caracteres",
    "string.empty": "A  senha  não  pode  ser  vazia",
  }),
});

//middleware   para   validar  usuário
function validarUsuario(req, res, next) {
  const { error } = usuarioSchema.validate(req.body, { abortEarly: false });
  console.log(error);
  if (error) {
    return res.status(400).json({
      erro: error.details.map((e) => e.message),
    });
  }
  next();
}

module.exports = validarUsuario;
