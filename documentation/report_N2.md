**Principais Alterações:**

1.  **Paralelização Interna nos Algoritmos:**
    * **Quick Sort:** A função `quickSortParallel` agora utiliza `worker_threads` para ordenar as partições menores em paralelo. Um limite `maxSubArraySizeForParallel` é definido para evitar overhead com subarrays pequenos. A contagem de comparações e trocas é acumulada dos workers.
    * **Merge Sort:** Similar ao Quick Sort, `mergeSortParallel` utiliza workers para ordenar as metades do array em paralelo. A etapa de merge continua sendo sequencial. A contagem de comparações e trocas também é acumulada.
    * **`isWorker` Flag:** Uma flag `isWorker` é passada para os workers internos para diferenciar a execução inicial do algoritmo da execução dentro de um worker paralelo.
    * **Limitação de Workers:** O código tenta limitar o número de workers ativos para não sobrecarregar o sistema (`activeWorkers.size < numCores`).
    * **Tratamento de Erros em Workers:** Adicionado tratamento para erros e exits inesperados dos workers paralelos.

2.  **`sortWorker.js`:**
    * Este arquivo agora apenas carrega os dados e inicia a ordenação no algoritmo principal. A lógica de paralelização para Quick Sort e Merge Sort reside dentro dos próprios algoritmos.

3.  **`routes.js`:**
    * Não houve alterações significativas aqui, pois a rota continua sendo responsável por iniciar o worker principal.

4.  **`opentelemetry/telemetry.js`:**
    * Nenhuma alteração necessária neste arquivo, pois a configuração básica já estava presente. A instrumentação dentro dos algoritmos e do worker garante o rastreamento da execução paralela.

**Como Executar:**

1.  Certifique-se de ter as dependências instaladas (`npm install`).
2.  Execute o servidor (`npm start` ou `node src/server.js`).
3.  Abra o navegador e acesse `http://localhost:3000`.
4.  Utilize a interface para gerar números e executar os algoritmos.
5.  Verifique os logs no console do servidor e no Jaeger (`http://localhost:16686`) para observar a execução paralela e os traces.

**Observações Importantes:**

* **Ajuste do Limite:** O valor de `maxSubArraySizeForParallel` dentro dos arquivos dos algoritmos `QuickSort` e `MergeSort` pode precisar ser ajustado com testes para encontrar o melhor equilíbrio entre paralelização e overhead de criação de workers.
* **Overhead:** A paralelização interna pode adicionar um overhead devido à criação e gerenciamento de threads. Para conjuntos de dados pequenos, a versão sequencial pode ser mais rápida.
* **Monitoramento no Jaeger:** Ao executar os algoritmos Quick Sort e Merge Sort com tamanhos de dados maiores, você deverá ver spans adicionais no Jaeger representando os workers internos sendo criados e executados.

Este código completo implementa a execução paralela dentro dos algoritmos Quick Sort e Merge Sort, mantendo o registro de logs com OpenTelemetry e o monitoramento com Jaeger. Certifique-se de testar bem e ajustar os parâmetros conforme necessário para o seu ambiente. A paralelização geral do programa ainda é feita e monitorada pelo Telemetry e Jaeger.

**Conclusões: Possíveis Causas para a Regressão de Desempenho:**

* **Overhead da Criação de Threads:** A criação de novas threads (`new Worker()`) é uma operação relativamente custosa. Para conjuntos de dados menores, o tempo gasto para criar e gerenciar as threads pode ser maior do que o tempo economizado com a execução paralela.
* **Tamanho do Subarray para Paralelização:** Foi definido `maxSubArraySizeForParallel` como 100000. Isso significa que a paralelização só ocorrerá quando o array tiver um tamanho maior que 100.000. Nos meus testes com 100.000 elementos, a paralelização está sendo ativada desde o início, o que pode ser ineficiente para as primeiras divisões do array.
* **Comunicação entre Threads:** A comunicação de dados entre as threads (enviar subarrays e receber os resultados ordenados) também tem um custo. Para conjuntos de dados não muito grandes, esse custo de comunicação pode superar os benefícios da paralelização.
* **Número de Cores:** A eficiência da paralelização depende do número de cores disponíveis na sua CPU. Se o número de cores for baixo, o ganho com a paralelização será limitado.
* **Aproximação de Swaps:** Usamos `swaps += merged.length;` como uma aproximação do número de swaps. Embora isso possa não ser a principal causa da lentidão, é importante notar que não é o valor exato.

**Análise Código:**

O código para o Merge Sort paralelo está estruturalmente correto. Ele divide o array, envia as metades para workers quando o tamanho é grande o suficiente, e depois merge os resultados.

**Possíveis Melhorias e Ajustes:**

* **Ajustar `maxSubArraySizeForParallel`:** Este é o ponto mais provável de melhoria. Tentar diminuir significativamente esse valor. Comece com valores como 1000 ou 5000 e faça testes para ver qual valor oferece o melhor desempenho para o seu hardware e tamanho de dados. A ideia é que a paralelização só seja usada para subarrays grandes o suficiente para compensar o overhead da criação de threads.

    ```javascript
    const maxSubArraySizeForParallel = 5000; // Tente um valor menor
    ```

* **Limitar a Recursão Paralela:** Pode ser necessário limitar a profundidade da recursão onde a paralelização é aplicada. Por exemplo, você pode usar paralelização apenas nos primeiros níveis da divisão do array e, para subarrays menores, usar a versão sequencial do Merge Sort. Isso pode reduzir o número total de threads criadas.

* **Reutilização de Workers (Mais Complexo):** Para evitar o custo de criação de threads a cada chamada recursiva, necessário implementar um pool de workers. No entanto, isso adiciona uma complexidade significativa ao código.

* **Medição Precisa de Swaps (Menor Impacto no Desempenho):** Para obter o número exato de swaps, contamo-las dentro da função merge, de forma semelhante ao que é feito com as comparações.

**Por que a Diferença de Resultados?**

A diferença nos resultados de tempo de execução entre a versão sequencial e a paralela pode ser explicada pelo overhead da paralelização. Para o tamanho de dados de 100.000, o custo de criar e gerenciar as threads, juntamente com a comunicação entre elas, pode estar superando o ganho de desempenho da execução paralela.

**Recomendação:**

Comece diminuindo o valor de `maxSubArraySizeForParallel` para algo como 5000 e execute seus testes novamente. Monitore o tempo de execução e experimente diferentes valores para encontrar o ponto ideal para o seu ambiente. Lembre-se que o desempenho da paralelização pode variar dependendo do hardware e do tamanho dos dados. Para conjuntos de dados menores, a versão sequencial do Merge Sort provavelmente será mais eficiente devido ao menor overhead.

**Testes Adicionais e Análise Detalhada:**

* **Arrays Pequenos (até 10.000 elementos):** A versão sequencial do Merge Sort apresentou um desempenho consistentemente melhor. A criação e o gerenciamento de workers adicionaram um overhead significativo que não foi compensado pelo paralelismo. O uso de CPU mostrou picos no início e no fim da execução da versão paralela, correspondendo à criação e finalização dos workers.

* **Arrays Médios (100.000 elementos):** A versão paralela começou a mostrar uma melhora no desempenho, embora ainda marginal em alguns casos. O ajuste do `maxSubArraySizeForParallel` para valores menores (como 5.000 ou 10.000) resultou em ganhos mais consistentes. O monitoramento do uso de CPU revelou uma utilização mais distribuída ao longo do tempo, indicando que os workers estavam ativos simultaneamente.

**Impacto do `maxSubArraySizeForParallel`:**

Ajustar o valor de `maxSubArraySizeForParallel` é crucial. Um valor muito alto impede a paralelização para subarrays menores, onde ela poderia ser benéfica. Um valor muito baixo pode levar à criação excessiva de workers para subarrays muito pequenos, aumentando o overhead e potencialmente degradando o desempenho.

Os testes sugerem que um valor entre 5.000 e 10.000 pode ser um bom ponto de partida, mas o ideal é realizar testes extensivos com os tamanhos de dados esperados na aplicação real.

**Considerações sobre o Ambiente de Execução:**

O número de cores da CPU da máquina de execução tem um impacto direto no potencial de paralelização. Em máquinas com poucos cores, o ganho da paralelização será limitado. Em ambientes com muitos cores, a versão paralela tem maior potencial de escalabilidade.

A carga do sistema também pode influenciar os resultados. Outros processos rodando simultaneamente podem competir por recursos, afetando o desempenho da versão paralela, que é mais sensível à disponibilidade de threads.

**Conclusão Final:**

A implementação da paralelização interna nos algoritmos de ordenação é uma abordagem válida para melhorar o desempenho em cenários com grandes volumes de dados. No entanto, é crucial ajustar os parâmetros corretamente e considerar o overhead introduzido pela criação e gerenciamento de threads. Para conjuntos de dados menores, a versão sequencial ainda pode ser a mais eficiente. A análise detalhada e os testes com os tamanhos de dados específicos da aplicação são essenciais para determinar a melhor estratégia e otimizar o desempenho.