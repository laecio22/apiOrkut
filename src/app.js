require("dotenv").config();
const express = require("express");
const pool = require("./config/db");
const validarPost = require("./validacao/post");
const auth = require("./auth/authLogin");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());

//rota login
app.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await pool.query(
      `
         SELECT *  FROM usuarios  WHERE email=$1        
        `,
      [email],
    );

    if (usuario.rows.length === 0) {
      return res.status(400).json({
        mensagem: "Usuário  não  encontrado",
      });
    }

    if (senha !== usuario.rows[0].senha) {
      return res.status(400).json({
        mensagem: "Senha  inválida",
      });
    }

    const token = jwt.sign(
      {
        id: usuario.rows[0].id,
      },
      process.env.JWT_KEY_SECRET,
      { expiresIn: "1h" },
    );

    console.log("login secreto", process.env.JWT_KEY_SECRET);

    res.json({
      token,
    });
  } catch (error) {
    console.log("erro no login", error);
    res.status(500).json({
      mensagem: "Erro  interno do  servidor",
    });
  }
});

app.get("/", (req, res) => {
  res.send("<h1>Rede Social!</h1>");
});

//rota  listar posts
app.get("/posts", async (req, res) => {
  try {
    const resultado = await pool.query(`
        SELECT
          usuarios.id, 
          usuarios.nome,
          post.titulo,
          post.conteudo,
          post.criado_em,
          post.id AS post_id
          FROM post
          JOIN usuarios
          ON post.usuario_id = usuarios.id
          ORDER BY post.criado_em DESC
        `);

    res.json(resultado.rows);
  } catch (error) {
    res.status(500).json({
      erro: "Erro  ao buscar   postagens",
    });
  }
});

//rota  criar post
app.post("/posts", auth, validarPost, async (req, res) => {
  try {
    const { titulo, conteudo } = req.body;
    const resultado = await pool.query(
      `
        INSERT INTO post (
        titulo, conteudo, usuario_id
        ) VALUES($1, $2, $3)
         RETURNING *
      `,
      [titulo, conteudo, req.usuario.id],
    );
    res.status(201).json({
      mensagem: "Post  criado com sucesso!",
      post: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      erro: "Erro ao   criar postagem",
    });
  }
});

//rota  atualizar  post
app.put("/posts/:id", validarPost, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, conteudo } = req.body;
    //comando sql  para atualizar  um post
    const resultado = await pool.query(
      `
           UPDATE post SET titulo=$1, conteudo=$2  WHERE id=$3
           RETURNING *
        `,
      [titulo, conteudo, id],
    );
    res.status(200).json({
      mensagem: "Post  atualizado  com  sucesso!",
      post: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      erro: "Não  foi  possível  atualizar  o post",
    });
  }
});

//rota  deletar  post

app.delete("/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const resultado = await pool.query(
      `
           DELETE FROM post WHERE id=$1
           RETURNING *
         `,
      [id],
    );

    res.json({
      mensagem: "Post  deletado  com sucesso!",
      post: resultado.rows[0],
    });
  } catch (error) {
    res.status(500).json({
      erro: "Não  foi possível  deletar  o  post",
      post: resultado.rows[0],
    });
  }
});

module.exports = app;
