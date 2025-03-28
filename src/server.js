const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./routes");
const app = express();

// Habilita o CORS para todas as rotas
app.use(cors());

// Middleware para processar JSON
app.use(express.json());

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, "../public")));

// Usar as rotas da API
app.use("/", routes);

// Iniciar o servidor
app.listen(3000, () => console.log("Servidor rodando na porta 3000"));