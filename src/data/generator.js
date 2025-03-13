const fs = require("fs");

function generateNumbers(size) {
    const numbers = Array.from({ length: size }, () => Math.floor(Math.random() * 100000));
    fs.writeFileSync(`src/data/numbers_${size}.txt`, numbers.join(","));
    console.log(`Arquivo numbers_${size}.txt criado com ${size} números.`);
}

// Exporta a função para ser usada em outros módulos
module.exports = generateNumbers;