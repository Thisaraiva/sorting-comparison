let results = []; // Armazena os resultados de cada execução

// Função para gerar novos números
async function generateNumbers() {
    try {
        const response = await fetch("http://localhost:3000/generate-numbers", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
        } else {
            alert(`Erro: ${data.error}`);
        }
    } catch (error) {
        console.error("Erro ao gerar números:", error);
        alert(`Erro ao gerar números: ${error.message}`);
    }
}

// Função para executar o algoritmo de ordenação
async function runSort() {
    const algorithm = document.getElementById("algorithm").value;
    const size = document.getElementById("size").value;

    try {
        // Faz a requisição para a API
        const response = await fetch(`http://localhost:3000/sort/${algorithm}/${size}`);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.statusText}`);
        }
        const data = await response.json();

        // Adiciona o resultado ao array de resultados
        results.push({
            algorithm,
            time: data.time,
            comparisons: data.comparisons,
            swaps: data.swaps
        });

        // Atualiza a tabela de resultados
        updateTable();

        // Atualiza o gráfico
        updateChart();
    } catch (error) {
        console.error("Erro ao executar o algoritmo:", error);
        alert(`Erro ao executar o algoritmo: ${error.message}`);
    }
}

// Função para atualizar a tabela de resultados
function updateTable() {
    const tableBody = document.querySelector("#results-table tbody");
    tableBody.innerHTML = ""; // Limpa a tabela

    // Adiciona cada resultado na tabela
    results.forEach(result => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${result.algorithm}</td>
            <td>${result.time}</td>
            <td>${result.comparisons}</td>
            <td>${result.swaps}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Função para atualizar o gráfico
function updateChart() {
    const ctx = document.getElementById("chart").getContext("2d");

    // Destrói o gráfico anterior, se existir
    if (window.myChart) {
        window.myChart.destroy();
    }

    // Cria um novo gráfico
    window.myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: results.map(result => result.algorithm),
            datasets: [
                {
                    label: "Tempo (ms)",
                    data: results.map(result => result.time),
                    backgroundColor: "rgba(75, 192, 192, 0.6)",
                },
                {
                    label: "Comparações",
                    data: results.map(result => result.comparisons),
                    backgroundColor: "rgba(255, 99, 132, 0.6)",
                },
                {
                    label: "Trocas",
                    data: results.map(result => result.swaps),
                    backgroundColor: "rgba(54, 162, 235, 0.6)",
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}