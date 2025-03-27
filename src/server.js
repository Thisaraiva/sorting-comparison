const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeTelemetry } = require('./opentelemetry/telemetry');
const routes = require('./routes');

async function startServer() {
    // Inicializa o telemetry primeiro e obtém registerLog
    const telemetry = await initializeTelemetry();
    const registerLog = telemetry.registerLog || console.log;

    const app = express();

    // Configurações do Express
    app.use(cors());
    app.use(express.json());
    app.use(express.static(path.join(__dirname, '../public')));

    // Middleware de logging
    app.use((req, res, next) => {
        registerLog('info', `Requisição recebida: ${req.method} ${req.path}`);
        next();
    });

    // Rotas
    app.use('/', routes);

    // Middleware de erro
    app.use((err, req, res, next) => {
        registerLog('error', 'Erro na aplicação', {
            error: err.message,
            stack: err.stack,
            path: req.path,
            method: req.method
        });
        res.status(500).json({ error: 'Erro interno do servidor' });
    });

    // Inicia o servidor
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        registerLog('info', `Servidor rodando na porta ${PORT}`);
        console.log(`Servidor rodando na porta ${PORT}`);
        console.log(`Jaeger UI: http://localhost:16686`);
    });
}

startServer().catch(err => {
    console.error('Falha ao iniciar o servidor:', err);
    process.exit(1);
});