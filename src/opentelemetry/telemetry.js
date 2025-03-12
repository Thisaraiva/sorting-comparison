const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

// Configuração do OTLP Exporter (usando HTTP)
const traceExporter = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces', // Endpoint do Jaeger para OTLP
});

// Configuração do SDK do OpenTelemetry
const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
});

// Inicializa o SDK
sdk.start();
console.log('OpenTelemetry SDK inicializado com sucesso.');

// Encerra o SDK ao finalizar o processo
process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('OpenTelemetry SDK encerrado.'))
        .catch((error) => console.error('Erro ao encerrar o OpenTelemetry SDK:', error))
        .finally(() => process.exit(0));
});