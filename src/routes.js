const express = require("express");
const { Worker } = require("worker_threads");
const generateNumbers = require("./data/generator");
const { registerLog } = require("./opentelemetry/telemetry");
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// Rota para gerar novos números
router.post("/generate-numbers", async (req, res) => {
    const requestId = uuidv4();
    registerLog('info', 'Iniciando geração de números', { requestId });

    try {
        await Promise.all([
            generateNumbers(1000),
            generateNumbers(10000),
            generateNumbers(100000)
        ]);

        registerLog('info', 'Números gerados com sucesso', { requestId });
        res.json({ success: true, message: "Arquivos gerados com sucesso." });
    } catch (error) {
        registerLog('error', 'Erro ao gerar números', { 
            error: error.message,
            requestId
        });
        res.status(500).json({ error: "Erro ao gerar números." });
    }
});

// Rota para executar o algoritmo de ordenação
router.get("/sort/:algorithm/:size", async (req, res) => {
    const { algorithm, size } = req.params;
    const workerId = uuidv4();
    const requestId = uuidv4();

    registerLog('info', 'Iniciando execução de algoritmo', {
        algorithm,
        size,
        workerId,
        requestId
    });

    try {
        const result = await new Promise((resolve, reject) => {
            const worker = new Worker("./src/workers/sortWorker.js", {
                workerData: { 
                    algorithm, 
                    size,
                    workerId
                }
            });

            worker.on("message", (result) => {
                if (result.error) {
                    reject(new Error(result.error));
                } else {
                    registerLog('info', 'Execução concluída', {
                        ...result,
                        requestId
                    });
                    resolve(result);
                }
            });

            worker.on("error", reject);
            worker.on("exit", (code) => {
                if (code !== 0) {
                    reject(new Error(`Worker finalizado com código ${code}`));
                }
            });
        });

        res.json(result);
    } catch (error) {
        registerLog('error', 'Erro na execução', {
            algorithm,
            size,
            error: error.message,
            workerId,
            requestId
        });
        res.status(500).json({ 
            error: error.message,
            details: {
                algorithm,
                size
            }
        });
    }
});

module.exports = router;