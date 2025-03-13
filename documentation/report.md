# Relatório Geral da Atividade e Documentação da Aplicação

## 1. Código-fonte documentado e organizado

O projeto Sorting Comparison foi desenvolvido seguindo boas práticas de organização e documentação do código. A estrutura do repositório foi projetada para manter a separação de responsabilidades entre os diferentes módulos da aplicação, permitindo uma implementação modular e extensível.

### 1.1 Estrutura do Repositório

A organização do projeto segue uma abordagem clara e bem definida:

```perl
sorting-comparison/
│── documentation/               # Documentação do projeto
│   ├── report.txt               # Relatório técnico do projeto
│
│── node_modules/                # Dependências do projeto (gerenciado pelo npm)
│
│── public/                      # Frontend da aplicação
│   ├── index.html               # Página principal da interface web
│   ├── script.js                # Lógica para interação no frontend
│   ├── styles.css               # Estilos CSS
│
│── src/                         # Código-fonte principal da aplicação
│   │── algorithms/              # Implementações dos algoritmos de ordenação
│   │   ├── bubbleSort.js
│   │   ├── bubbleSortImproved.js
│   │   ├── countingSort.js
│   │   ├── heapSort.js
│   │   ├── insertionSort.js
│   │   ├── mergeSort.js
│   │   ├── quickSort.js
│   │   ├── radixSort.js
│   │   ├── selectionSort.js
│   │   ├── shellSort.js
│   │   ├── timSort.js
│   │   ├── strategy.js          # Implementação do padrão Strategy
│   │
│   │── data/                    # Geração e armazenamento de dados de entrada
│   │   ├── generator.js         # Script para gerar números aleatórios
│   │   ├── numbers_1000.txt
│   │   ├── numbers_10000.txt
│   │   ├── numbers_100000.txt
│   │
│   │── logs/                    # Diretório para armazenar logs de execução
│   │   ├── execution.log
│   │
│   │── opentelemetry/           # Configuração do OpenTelemetry
│   │   ├── telemetry.js
│   │
│   │── workers/                 # Workers para execução assíncrona dos algoritmos
│   │   ├── sortWorker.js
│   │
│   ├── routes.js                # Definição das rotas da API
│   ├── server.js                # Configuração do servidor Express
│
│── .gitignore                   # Arquivos ignorados pelo Git
│── package.json                 # Dependências do projeto
│── package-lock.json            # Controle de versões das dependências
│── README.md                    # Documentação inicial do projeto

```

### 1.2 Organização do Código

O código foi estruturado para garantir clareza, manutenibilidade e modularidade. A divisão em pastas reflete essa abordagem, separando algoritmos, dados, logs, configurações de telemetria, trabalhadores assíncronos (workers) e lógica do servidor.

#### Algoritmos de Ordenação

Cada algoritmo foi implementado como uma classe separada dentro da pasta `src/algorithms`, seguindo o padrão Strategy para permitir flexibilidade e substituição dinâmica de algoritmos.

Exemplo de estrutura do algoritmo Bubble Sort (`bubbleSort.js`):

```javascript
const SortStrategy = require("./strategy");

class BubbleSort extends SortStrategy {
    sort(array) {
        let comparisons = 0;
        let swaps = 0;
        let n = array.length;
        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                comparisons++;
                if (array[j] > array[j + 1]) {
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                    swaps++;
                }
            }
        }
        return { sortedArray: array, comparisons, swaps };
    }
}

module.exports = BubbleSort;
```

Implementação do Padrão Strategy
A classe strategy.js permite a fácil substituição de algoritmos de ordenação em tempo de execução:

```javascript
class SortStrategy {
    sort(array) {
        throw new Error("Método sort() deve ser implementado!");
    }
}

module.exports = SortStrategy;
```

### Execução Assíncrona com Workers

O arquivo `sortWorker.js` utiliza Web Workers para paralelizar a execução dos algoritmos e medir métricas como tempo de execução, número de comparações e trocas.

### Comentários no código

O código foi escrito em JavaScript/Node.js, utilizando a estrutura de pastas e arquivos descrita na estrutura acima. Os comentários foram utilizados no código para facilitar a identificação e as funcionalidades de cada trecho do código para melhor entendimento por parte do desenvolvedor que estiver trabalhando com os arquivos da aplicação.

### 1.4 Tecnologias Utilizadas

O projeto faz uso das seguintes tecnologias para garantir desempenho e escalabilidade:

* ✅ Backend: Node.js com Express.js
* ✅ Frontend: HTML, CSS e JavaScript
* ✅ Gerenciamento de Logs: OpenTelemetry integrado ao Jaeger
* ✅ Execução Assíncrona: Web Workers para paralelização dos algoritmos
* ✅ Banco de Dados: Arquivos de texto armazenando os conjuntos de dados na pasta "data" na estrutura do projeto.

#### Comandos utilizados para a execução do programa e geração dos logs:

* Ativar o Open Telemetry
    * `node src/opentelemetry/telemetry.js`
* Ativar o Servidor:
    * `node src/server.js`
* URL da aplicação
    * `http://localhost:3000`
* Imagem Docker (Utilizado Docker Desktop do Windows) do Jaeger e URL para identificação dos LOGS:
    * Imagem: `docker run -d --name jaeger -e COLLECTOR_OTLP_ENABLED=true -p 16686:16686 -p 4317:4317 -p 4318:4318 jaegertracing/all-in-one:latest`
    * URL: `http://localhost:16686`

Opção 1: Comando em uma única linha:

```bash
docker run -d --name jaeger -e COLLECTOR_OTLP_ENABLED=true -p 16686:16686 -p 4317:4317 -p 4318:4318 jaegertracing/all-in-one:latest
```

Opção 2: Usando ^ para continuar a linha:

```bash
docker run -d --name jaeger ^
  -e COLLECTOR_OTLP_ENABLED=true ^
  -p 16686:16686 ^
  -p 4317:4317 ^
  -p 4318:4318 ^
  jaegertracing/all-in-one:latest
```

#### Observações sobre alguns algoritmos:

* **Counting Sort e Radix Sort:**
    * O Counting Sort e o Radix Sort não estão contando comparações e trocas. Esses algoritmos não realizam comparações no sentido tradicional, mas podemos contar as operações relevantes.
    * Adicionei contadores para "trocas" no Counting Sort e Radix Sort. Cada vez que um elemento é movido para o array de saída, ele conta como uma "troca".
* **Counting Sort:**
    * Assim como o Radix Sort, o Counting Sort não realiza comparações no sentido tradicional. Estou contando cada movimentação para o array output como uma "troca".

## 2. Uso do Padrão Strategy no Projeto

### Introdução ao Padrão Strategy

O padrão Strategy é um dos padrões de projeto comportamentais do catálogo do GoF (Gang of Four). Ele permite definir uma família de algoritmos, encapsulá-los e torná-los intercambiáveis. Dessa forma, o algoritmo pode ser selecionado dinamicamente em tempo de execução, promovendo flexibilidade e modularidade no código.

### Aplicação no Projeto

No projeto, foi utilizado o padrão Strategy para estruturar os algoritmos de ordenação de forma modular e extensível. Isso permite que novos algoritmos sejam adicionados sem modificar o código principal da aplicação.

### Implementação

Foi criado o arquivo `strategy.js`, que define a interface genérica para os algoritmos de ordenação. Cada algoritmo de ordenação foi implementado separadamente dentro da pasta `src/algorithms`, seguindo a mesma estrutura e assinatura de função. O programa principal permite escolher dinamicamente o algoritmo desejado para ordenar os dados carregados.

### Exemplo de Código

#### 1. Definição da Strategy (`strategy.js`)

```javascript
class SortStrategy {
    sort(data) {
        throw new Error("Método 'sort()' deve ser implementado.");
    }
}

module.exports = SortStrategy;
```

Essa classe abstrata garante que todas as estratégias sigam um mesmo contrato, obrigando a implementação do método sort() em cada algoritmo de ordenação.

####2. Implementação de um Algoritmo (Exemplo: Quick Sort)

```javascript
const SortStrategy = require("./strategy");

class QuickSort extends SortStrategy {
    sort(array) {
        let comparisons = 0;
        let swaps = 0;

        function partition(arr, low, high) {
            const pivot = arr[high];
            let i = low - 1;
            for (let j = low; j < high; j++) {
                comparisons++;
                if (arr[j] < pivot) {
                    i++;
                    if (i !== j) { // Evita troca desnecessária
                        [arr[i], arr[j]] = [arr[j], arr[i]];
                        swaps++;
                    }
                }
            }
            if (i + 1 !== high) { // Evita troca desnecessária do pivô
                [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
                swaps++;
            }
            return i + 1;
        }

        function quickSort(arr, low, high) {
            if (low < high) {
                const pi = partition(arr, low, high);
                quickSort(arr, low, pi - 1);
                quickSort(arr, pi + 1, high);
            }
        }

        quickSort(array, 0, array.length - 1);
        return { sortedArray: array, comparisons, swaps };
    }
}


module.exports = QuickSort;
```

Aqui, a classe QuickSort estende SortingStrategy e implementa o método sort(), garantindo que o algoritmo siga o contrato definido pela Strategy.

#### 3. Seleção do Algoritmo em Tempo de Execução (routes.js e sortWorker.js)

- routes.js
```javascript
// Rota para executar o algoritmo de ordenação
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
```

- sortWorker.js
```javascript
// Seleciona o algoritmo com base no parâmetro recebido
switch (algorithm) {
    case "bubble":
        sorter = new BubbleSort();
        break;
    case "bubble-improved":
        sorter = new BubbleSortImproved();
        break;
    case "insertion":
        sorter = new InsertionSort();
        break;
    case "selection":
        sorter = new SelectionSort();
        break;
    case "quick":
        sorter = new QuickSort();
        break;
    case "merge":
        sorter = new MergeSort();
        break;
    case "tim":
        sorter = new TimSort();
        break;
    case "heap":
        sorter = new HeapSort();
        break;
    case "counting":
        sorter = new CountingSort();
        break;
    case "radix":
        sorter = new RadixSort();
        break;
    case "shell":
        sorter = new ShellSort();
        break;
    default:
        throw new Error("Algoritmo inválido");
}

// Lê os dados do arquivo
try {
    const filePath = `src/data/numbers_${size}.txt`;
    console.log(`Lendo arquivo: ${filePath}`);

    const data = fs.readFileSync(filePath, "utf8");
    console.log(`Dados lidos: ${data.substring(0, 50)}...`); // Exibe os primeiros 50 caracteres

    let numbers = data.split(",").map(Number);
    console.log(`Números convertidos: ${numbers.length} elementos`);

    if (!numbers || numbers.length === 0) {
        throw new Error("Dados inválidos ou arquivo vazio.");
    }

    // Executa o algoritmo e mede o tempo de execução
    const start = Date.now();
    const result = sorter.sort(numbers);
    const end = Date.now();

    // Logs detalhados
    const logMessage = `Lendo arquivo: ${filePath}, Algoritmo: ${algorithm}, Tamanho do conjunto de dados: ${size}, Dados lidos: ${data.substring(0, 50)}..., Números convertidos: ${numbers.length} elementos, Tempo de execução: ${end - start}ms, Comparações: ${result.comparisons}, Trocas: ${result.swaps}`;
    console.log(logMessage);

    // Escreve o log no arquivo execution.log
    fs.appendFileSync('src/logs/execution.log', `${new Date().toISOString()} - ${logMessage}\n`);

    // Envia os resultados de volta para o thread principal
    parentPort.postMessage({
        algorithm,
        size,
        time: end - start, // Tempo de execução em milissegundos
        comparisons: result.comparisons, // Número de comparações
        swaps: result.swaps, // Número de trocas
    });
} catch (error) {
    console.error(`Erro no Worker: ${error.message}`);
    fs.appendFileSync('src/logs/execution.log', `${new Date().toISOString()} - Erro no Worker: ${error.message}\n`);
    parentPort.postMessage({
        error: error.message,
    });
}
```

Aqui, o programa permite escolher o algoritmo dinamicamente em tempo de execução, chamando const result = sorter.sort(numbers), baseado na escoha do switch case.

Vantagens do Uso do Padrão Strategy
* ✅ Modularidade: Cada algoritmo é isolado em sua própria classe, facilitando a manutenção.
* ✅ Extensibilidade: Novos algoritmos podem ser adicionados sem alterar a lógica principal do programa.
* ✅ Flexibilidade: O algoritmo pode ser escolhido dinamicamente com base em parâmetros externos.
* ✅ Organização do Código: Evita estruturas condicionais complexas, melhorando a legibilidade.

O uso do padrão Strategy foi essencial para garantir que a implementação dos algoritmos de ordenação fosse estruturada de forma limpa e eficiente. Com essa abordagem, conseguimos criar um sistema flexível que pode ser facilmente expandido para incluir novos algoritmos sem afetar a lógica existente.

## 4. Processo de Geração dos Dados

O processo de geração dos dados é essencial para a execução e avaliação dos algoritmos de ordenação. Ele envolve a criação de arquivos contendo conjuntos de números aleatórios, que posteriormente são utilizados como entrada nos algoritmos. Esse processo garante que a análise de desempenho seja realizada com dados variados e de tamanhos diferentes.

### 4.1. Geração dos Números Aleatórios

A geração dos dados é realizada pelo arquivo `src/data/generator.js`. Esse script é responsável por:

* Criar um conjunto de números aleatórios de tamanhos definidos pelo usuário (1.000, 10.000 ou 100.000 elementos);
* Gerar valores aleatórios dentro do intervalo de 0 a 99.999;
* Armazenar os números em arquivos de texto no formato `numbers_<size>.txt` dentro da pasta `src/data/`.

#### Funcionamento:

* A função `generateNumbers(size)` é chamada para gerar um array de números aleatórios.
* O array gerado é convertido em uma string separada por vírgulas e salvo no arquivo correspondente.
* Um log é gerado no console informando a criação do arquivo.

#### Interação com a Interface do Usuário:

O botão "Gerar Novos Números Aleatórios" na interface web aciona a função `generateNumbers()` no arquivo `public/script.js`. Esse botão envia uma requisição HTTP para o backend (`http://localhost:3000/generate-numbers`), que por sua vez executa a função `generateNumbers(size)` do `generator.js`.

* Se a geração for bem-sucedida, uma mensagem de sucesso é exibida na interface.
* Caso ocorra um erro, o usuário é notificado.

#### Uso dos Dados Gerados:

Os arquivos contendo os números são posteriormente lidos pelos algoritmos de ordenação localizados na pasta `src/algorithms/`. O algoritmo selecionado pelo usuário acessa o arquivo correspondente ao tamanho definido e executa a ordenação dos números.

#### Registro e Monitoramento:

Para fins de análise de desempenho, cada execução é registrada no arquivo de log `src/logs/execution.log`, contendo informações como:

* Timestamp da execução;
* Nome do arquivo de entrada;
* Algoritmo utilizado;
* Tamanho do conjunto de dados;
* Tempo de execução (ms);
* Número de comparações e trocas realizadas.

Esses registros permitem avaliar a eficiência dos algoritmos e comparar seus desempenhos com diferentes tamanhos de entrada.

O processo de geração dos dados garante que os testes sejam realizados com entradas variadas e controladas. Isso possibilita uma análise comparativa mais precisa entre os algoritmos de ordenação, permitindo a identificação de suas vantagens e desvantagens em diferentes cenários.

Observação: Os arquivos gerados podem ser consultados na pasta src/data/numbers_<qtde_num>.txt

## 5. Métricas e Gráficos Comparativos de Desempenho

Para avaliar o desempenho dos algoritmos de ordenação utilizados na aplicação, foram coletadas métricas relevantes como tempo de execução (em milissegundos), número de comparações e quantidade de trocas realizadas durante o processo de ordenação. Essas métricas foram exibidas em uma tabela e representadas graficamente por meio de um gráfico de barras para facilitar a análise comparativa.

### Métricas Coletadas

Os algoritmos testados foram aplicados sobre um conjunto de números aleatórios gerados previamente e o arquivo com os logs foi gerado na pasta `src/log/execution.log`.

### Visualização Gráfica

A interface da aplicação exibe os resultados em um gráfico de barras utilizando a biblioteca Chart.js. O gráfico permite uma comparação visual entre os algoritmos em relação às três métricas analisadas. Com isso, torna-se mais fácil identificar qual algoritmo apresenta melhor desempenho para determinado critério.

A abordagem utilizada possibilita que o usuário execute diferentes algoritmos, compare seus desempenhos e escolha a melhor opção para diferentes cenários, dependendo do tamanho e da natureza dos dados.

Dessa forma, a análise das métricas e dos gráficos gerados proporciona uma visão detalhada do comportamento de cada algoritmo, auxiliando na compreensão de suas eficiências e limitações.

Observação: O arquivo de log com os resultados pode ser consultado na pasta src/logs/execution.log. Algumas imagens com a tela da aplicação apresentando os resultados da tabela e do gráfico comparativo na interface de usuário no navegador Chrome podem ser consultadas na pasta documentation/images/TabelaComparativaOrdenacao.png

* Abaixo uma parte do arquivo de log como foi criado:

2025-03-13T14:23:24.040Z - Lendo arquivo: src/data/numbers_1000.txt, Algoritmo: bubble, Tamanho do conjunto de dados: 1000, Dados lidos: 98452,55935,34655,76443,1333,50027,81259,23027,146..., Números convertidos: 1000 elementos, Tempo de execução: 15ms, Comparações: 499500, Trocas: 248408
2025-03-13T14:23:45.622Z - Lendo arquivo: src/data/numbers_10000.txt, Algoritmo: bubble, Tamanho do conjunto de dados: 10000, Dados lidos: 50425,16183,97847,96187,36778,95651,73011,16176,84..., Números convertidos: 10000 elementos, Tempo de execução: 239ms, Comparações: 49995000, Trocas: 25308908
2025-03-13T14:23:56.147Z - Lendo arquivo: src/data/numbers_10000.txt, Algoritmo: merge, Tamanho do conjunto de dados: 10000, Dados lidos: 50425,16183,97847,96187,36778,95651,73011,16176,84..., Números convertidos: 10000 elementos, Tempo de execução: 11ms, Comparações: 120522, Trocas: 133616
2025-03-13T14:24:05.912Z - Lendo arquivo: src/data/numbers_10000.txt, Algoritmo: quick, Tamanho do conjunto de dados: 10000, Dados lidos: 50425,16183,97847,96187,36778,95651,73011,16176,84..., Números convertidos: 10000 elementos, Tempo de execução: 9ms, Comparações: 145503, Trocas: 65868
2025-03-13T15:09:19.065Z - Lendo arquivo: src/data/numbers_10000.txt, Algoritmo: quick, Tamanho do conjunto de dados: 10000, Dados lidos: 50425,16183,97847,96187,36778,95651,73011,16176,84..., Números convertidos: 10000 elementos, Tempo de execução: 42ms, Comparações: 145503, Trocas: 65868
2025-03-13T15:09:24.993Z - Lendo arquivo: src/data/numbers_10000.txt, Algoritmo: merge, Tamanho do conjunto de dados: 10000, Dados lidos: 50425,16183,97847,96187,36778,95651,73011,16176,84..., Números convertidos: 10000 elementos, Tempo de execução: 56ms, Comparações: 120522, Trocas: 133616
2025-03-13T15:09:37.244Z - Lendo arquivo: src/data/numbers_1000.txt, Algoritmo: quick, Tamanho do conjunto de dados: 1000, Dados lidos: 98452,55935,34655,76443,1333,50027,81259,23027,146..., Números convertidos: 1000 elementos, Tempo de execução: 4ms, Comparações: 10032, Trocas: 4136
2025-03-13T15:09:41.798Z - Lendo arquivo: src/data/numbers_1000.txt, Algoritmo: merge, Tamanho do conjunto de dados: 1000, Dados lidos: 98452,55935,34655,76443,1333,50027,81259,23027,146..., Números convertidos: 1000 elementos, Tempo de execução: 11ms, Comparações: 8715, Trocas: 9976
2025-03-13T15:09:45.857Z - Lendo arquivo: src/data/numbers_1000.txt, Algoritmo: tim, Tamanho do conjunto de dados: 1000, Dados lidos: 98452,55935,34655,76443,1333,50027,81259,23027,146..., Números convertidos: 1000 elementos, Tempo de execução: 5ms, Comparações: 12483, Trocas: 7545
2025-03-13T15:09:49.992Z - Lendo arquivo: src/data/numbers_1000.txt, Algoritmo: heap, Tamanho do conjunto de dados: 1000, Dados lidos: 98452,55935,34655,76443,1333,50027,81259,23027,146..., Números convertidos: 1000 elementos, Tempo de execução: 19ms, Comparações: 19220, Trocas: 9110
2025-03-13T15:09:59.179Z - Lendo arquivo: src/data/numbers_1000.txt, Algoritmo: counting, Tamanho do conjunto de dados: 1000, Dados lidos: 98452,55935,34655,76443,1333,50027,81259,23027,146..., Números convertidos: 1000 elementos, Tempo de execução: 10ms, Comparações: 100798, Trocas: 1000

## 5. Descrição da ferramenta utilizada para logs e análise dos resultados

Para a captura e análise dos logs gerados durante a execução dos algoritmos de ordenação, utilizou-se o OpenTelemetry como ferramenta principal de instrumentação, em conjunto com o Jaeger para visualização dos traces e logs. Além disso, empregou-se uma abordagem baseada na coleta de métricas e exibição gráfica dos dados utilizando JavaScript, HTML e a biblioteca Chart.js.

### Instrumentação e Coleta de Logs

A instrumentação do código foi realizada com o OpenTelemetry, que permite a coleta automática de métricas, rastreamento de execuções e geração de logs detalhados. O SDK do OpenTelemetry foi configurado para exportar traces e logs via protocolo OTLP para o Jaeger, que é responsável pela visualização e análise dos dados gerados.

A configuração foi feita no arquivo `telemetry.js`, onde:

* O `OTLPTraceExporter` foi configurado para enviar os traces para o Jaeger via HTTP.
* O `OTLPLogExporter` foi utilizado para exportação de logs.
* O `LoggerProvider` do OpenTelemetry gerencia a coleta e envio dos logs de execução.

### Execução e Armazenamento dos Logs

Os logs detalhados das execuções dos algoritmos foram gerados dentro do arquivo `sortWorker.js`, que roda cada algoritmo em um Worker Thread para paralelismo eficiente. Cada execução registra:

* O nome do algoritmo executado.
* O tamanho do conjunto de dados processado.
* O tempo total de execução (em milissegundos).
* O número de comparações e trocas realizadas.

Os logs são armazenados no arquivo `execution.log` e também enviados ao Jaeger via OpenTelemetry para posterior análise.

### Visualização dos Resultados

Para facilitar a interpretação dos resultados, os dados de desempenho dos algoritmos foram coletados e representados graficamente utilizando a biblioteca Chart.js, que permite visualizar comparações de tempo de execução e eficiência dos diferentes métodos de ordenação.

A abordagem adotada, combinando OpenTelemetry, Jaeger e Chart.js, permitiu não apenas a captura e armazenamento estruturado dos logs, mas também a análise visual das métricas de desempenho dos algoritmos. Com essa solução, foi possível identificar padrões de eficiência e comparar os algoritmos de maneira clara e objetiva.

Observação: 
- Os arquivos de exemplo dos logs do Jaeger podem ser encontrados em documentation/images/LogJaeger.png e documentation/images/LogJaeger_1.png. Além de um arquivo documentation/traces-1741875658792.json que se refere a log do Jaeger com os traces registrados em um determinado período.
- O arquivo de log com os resultados pode ser consultado na pasta src/logs/execution.log. Algumas imagens com a tela da aplicação apresentando os resultados da tabela e do gráfico comparativo na interface de usuário no navegador Chrome podem ser consultadas na pasta documentation/iamges/TabelaComparativaOrdenacao.png

---

# 6. Conclusão

6. Vou dividir a análise em partes:

### **1. Qual algoritmo apresentou melhor desempenho em diferentes cenários?**
O desempenho dos algoritmos pode ser avaliado com base no **tempo de execução**, **número de comparações** e **número de trocas**. Os algoritmos que se destacaram foram:

- **Quick Sort**:
  - Tempo de execução: 2ms (1000 elementos), 10ms (10000 elementos), 25ms (100000 elementos).
  - Comparações: 10117 (1000 elementos), 154612 (10000 elementos), 2103881 (100000 elementos).
  - Trocas: 4436 (1000 elementos), 78431 (10000 elementos), 1076529 (100000 elementos).
  - O Quick Sort foi consistente e rápido em todos os cenários, especialmente para grandes conjuntos de dados.

- **Merge Sort**:
  - Tempo de execução: 2ms (1000 elementos), 8ms (10000 elementos), 58ms (100000 elementos).
  - Comparações: 8693 (1000 elementos), 120438 (10000 elementos), 1536239 (100000 elementos).
  - Trocas: 9976 (1000 elementos), 133616 (10000 elementos), 1668928 (100000 elementos).
  - O Merge Sort também teve um desempenho excelente, especialmente em conjuntos maiores.

- **Tim Sort**:
  - Tempo de execução: 1ms (1000 elementos), 7ms (10000 elementos), 31ms (100000 elementos).
  - Comparações: 12841 (1000 elementos), 136516 (10000 elementos), 1790443 (100000 elementos).
  - Trocas: 7897 (1000 elementos), 47681 (10000 elementos), 599882 (100000 elementos).
  - O Tim Sort foi o mais rápido em muitos cenários, especialmente para 1000 e 10000 elementos.

- **Radix Sort**:
  - Tempo de execução: 2ms (1000 elementos), 11ms (10000 elementos), 35ms (100000 elementos).
  - Comparações: 1044 (1000 elementos), 10044 (10000 elementos), 100044 (100000 elementos).
  - Trocas: 5000 (1000 elementos), 50000 (10000 elementos), 500000 (100000 elementos).
  - O Radix Sort teve um desempenho muito bom, especialmente em termos de comparações, mas requer que os dados sejam inteiros e limitados em magnitude.

---

### **2. Por que esses algoritmos apresentaram melhor desempenho?**
Os algoritmos que se destacaram (Quick Sort, Merge Sort, Tim Sort e Radix Sort) têm características que os tornam eficientes:

- **Quick Sort**:
  - Utiliza a estratégia de **dividir e conquistar**, dividindo o conjunto de dados em partições menores e ordenando-as recursivamente.
  - Tem complexidade média de **O(n log n)**, mas pode degradar para **O(n²)** no pior caso (raro com boas implementações).

- **Merge Sort**:
  - Também usa **dividir e conquistar**, dividindo o conjunto de dados em metades e combinando-as de forma ordenada.
  - Tem complexidade garantida de **O(n log n)** em todos os casos, mas requer espaço adicional para a combinação.

- **Tim Sort**:
  - É uma combinação de **Merge Sort** e **Insertion Sort**, otimizado para dados reais que podem ter subsequências já ordenadas.
  - Tem complexidade **O(n log n)** e é altamente eficiente para conjuntos de dados grandes.

- **Radix Sort**:
  - Ordena os números dígito a dígito, sem realizar comparações diretas.
  - Tem complexidade **O(nk)**, onde **k** é o número de dígitos, sendo muito eficiente para números inteiros.

---

### **3. Vale a pena usar Dividir e Conquistar?**
Sim, vale a pena usar algoritmos de **dividir e conquistar** (como Quick Sort e Merge Sort) porque:

- **Eficiência**: Esses algoritmos têm complexidade **O(n log n)** na maioria dos casos, o que é significativamente melhor do que algoritmos como Bubble Sort (O(n²)).
- **Escalabilidade**: Eles são mais adequados para conjuntos de dados grandes, como mostrado nos resultados para 10000 e 100000 elementos.
- **Versatilidade**: Algoritmos como Quick Sort e Merge Sort funcionam bem em diferentes tipos de dados e cenários.

No entanto, é importante considerar:
- **Quick Sort** pode ter um pior caso raro (O(n²)), mas isso pode ser mitigado com a escolha de um bom pivô.
- **Merge Sort** requer espaço adicional de memória, o que pode ser uma limitação em sistemas com restrições de memória.

---

### **4. Conclusão Geral**
- **Melhor desempenho**: Quick Sort, Merge Sort, Tim Sort e Radix Sort foram os mais eficientes em diferentes cenários.
- **Motivo**: Esses algoritmos utilizam estratégias eficientes como **dividir e conquistar** ou técnicas específicas (como ordenação por dígitos no Radix Sort), reduzindo o número de comparações e trocas.
- **Vale a pena usar Dividir e Conquistar**: Sim, especialmente para conjuntos de dados grandes, onde a eficiência é crítica. Algoritmos como Quick Sort e Merge Sort são amplamente utilizados na prática devido ao seu desempenho consistente.

Portanto, a escolha do algoritmo deve considerar o tamanho do conjunto de dados, a natureza dos dados (inteiros, strings, etc.) e as restrições de memória. Para a maioria dos casos, algoritmos de **dividir e conquistar** são a melhor opção.
