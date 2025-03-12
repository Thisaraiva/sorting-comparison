const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { LoggerProvider, SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');

// Configuração do OTLP Exporter para traces (usando HTTP)
const traceExporter = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces', // Endpoint do Jaeger para OTLP
});

// Configuração do OTLP Exporter para logs (usando HTTP)
const logExporter = new OTLPLogExporter({
    url: 'http://localhost:4318/v1/logs', // Endpoint do Jaeger para OTLP logs
});

// Configuração do LoggerProvider
const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter));

// Configuração do SDK do OpenTelemetry
const sdk = new NodeSDK({
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    loggerProvider, // Adiciona o LoggerProvider ao SDK
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