const express = require("express");
const { Worker } = require("worker_threads");
const generateNumbers = require("./data/generator"); // Importa a função do generator.js
const router = express.Router();
const { trace, SpanStatusCode } = require('@opentelemetry/api'); // Importa SpanStatusCode também
const tracer = trace.getTracer('sorting-app');

// Rota para gerar novos números
router.post("/generate-numbers", (req, res) => {
    tracer.startActiveSpan('route.generateNumbers', span => {
        try {
            generateNumbers(1000);
            generateNumbers(10000);
            generateNumbers(100000);
            span.setStatus({ code: SpanStatusCode.OK });
            span.end();
            res.json({ success: true, message: "Arquivos de números aleatórios gerados com sucesso." });
        } catch (error) {
            console.error("Erro ao gerar números:", error);
            span.recordException(error);
            span.setStatus({ code: SpanStatusCode.ERROR, description: error.message });
            span.end();
            res.status(500).json({ error: "Erro ao gerar números." });
        }
    });
});

// Rota para executar o algoritmo de ordenação
router.get("/sort/:algorithm/:size", (req, res) => {
    const { algorithm, size } = req.params;
    tracer.startActiveSpan('route.sort', span => {
        span.setAttributes({ 'algorithm': algorithm, 'data.size': size });
        console.log(`Executando ${algorithm} com ${size} números...`);

        const worker = new Worker("./src/workers/sortWorker.js", {
            workerData: { algorithm, size }
        });

        let responseSent = false;

        worker.on("message", (result) => {
            if (!responseSent) {
                if (result.error) {
                    console.error(`Erro no Worker: ${result.error}`);
                    span.recordException(new Error(`Erro no Worker: ${result.error}`));
                    span.setStatus({ code: SpanStatusCode.ERROR, description: result.error });
                    res.status(500).json({ error: result.error });
                } else {
                    console.log(`Resultado recebido: ${JSON.stringify(result)}`);
                    span.setStatus({ code: SpanStatusCode.OK });
                    res.json(result);
                }
                responseSent = true;
            }
            span.end();
        });

        worker.on("error", (error) => {
            if (!responseSent) {
                console.error(`Erro no Worker: ${error.message}`);
                span.recordException(error);
                span.setStatus({ code: SpanStatusCode.ERROR, description: error.message });
                res.status(500).json({ error: error.message });
                responseSent = true;
            }
            span.end();
        });

        worker.on("exit", (code) => {
            if (code !== 0 && !responseSent) {
                console.error(`Worker parou com código de saída ${code}`);
                const exitError = new Error(`Worker stopped with exit code ${code}`);
                span.recordException(exitError);
                span.setStatus({ code: SpanStatusCode.ERROR, description: `Worker stopped with exit code ${code}` });
                res.status(500).json({ error: `Worker stopped with exit code ${code}` });
                responseSent = true;
            }
            if (!responseSent) {
                span.end();
            }
        });
    });
});

module.exports = router;