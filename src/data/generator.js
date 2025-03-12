const fs = require("fs");

function generateNumbers(size) {
    const numbers = Array.from({ length: size }, () => Math.floor(Math.random() * 100000));
    fs.writeFileSync(`src/data/numbers_${size}.txt`, numbers.join(","));
    console.log(`Arquivo numbers_${size}.txt criado com ${size} números.`);
}

// Gerar arquivos para 1.000, 10.000 e 100.000 números
generateNumbers(1000);
generateNumbers(10000);
generateNumbers(100000);