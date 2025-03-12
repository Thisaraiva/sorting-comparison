const express = require("express");
const { Worker } = require("worker_threads");
const router = express.Router();

router.get("/sort/:algorithm/:size", (req, res) => {
    const { algorithm, size } = req.params;
    console.log(`Executando ${algorithm} com ${size} números...`);

    const worker = new Worker("./src/workers/sortWorker.js", {
        workerData: { algorithm, size }
    });

    let responseSent = false; // Flag para controlar se a resposta já foi enviada

    worker.on("message", (result) => {
        if (!responseSent) {
            if (result.error) {
                console.error(`Erro no Worker: ${result.error}`);
                res.status(500).json({ error: result.error });
            } else {
                console.log(`Resultado recebido: ${JSON.stringify(result)}`);
                res.json(result);
            }
            responseSent = true;
        }
    });

    worker.on("error", (error) => {
        if (!responseSent) {
            console.error(`Erro no Worker: ${error.message}`);
            res.status(500).json({ error: error.message });
            responseSent = true;
        }
    });

    worker.on("exit", (code) => {
        if (code !== 0 && !responseSent) {
            console.error(`Worker parou com código de saída ${code}`);
            res.status(500).json({ error: `Worker stopped with exit code ${code}` });
            responseSent = true;
        }
    });
});

module.exports = router;