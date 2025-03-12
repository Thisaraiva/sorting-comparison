const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const app = express();

// Habilita o CORS para todas as rotas
app.use(cors());

app.use(express.json());
app.use("/", routes);

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));