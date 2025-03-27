const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { LoggerProvider, SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { Resource } = require('@opentelemetry/resources');
const { SEMATTRS_SERVICE_NAME, SEMATTRS_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions');
const { diag, DiagConsoleLogger, DiagLogLevel } = require('@opentelemetry/api');
const fs = require('fs');
const path = require('path');

// Configuração básica de logging do OpenTelemetry
diag.setLogger(new DiagConsoleLogger(), {
    logLevel: DiagLogLevel.INFO
});

// Configuração do recurso para identificar o serviço
const resource = new Resource({
    [SEMATTRS_SERVICE_NAME]: 'sorting-comparison',
    [SEMATTRS_SERVICE_VERSION]: '1.0.0',
});

// Configuração dos exporters
const traceExporter = new OTLPTraceExporter({
    url: 'http://localhost:4318/v1/traces',
    headers: {},
    concurrencyLimit: 10,
    timeoutMillis: 30000
});

const logExporter = new OTLPLogExporter({
    url: 'http://localhost:4318/v1/logs',
    headers: {},
    concurrencyLimit: 10,
    timeoutMillis: 30000
});

// Configuração do LoggerProvider
const loggerProvider = new LoggerProvider({
    resource: resource,
});

loggerProvider.addLogRecordProcessor(
    new SimpleLogRecordProcessor(logExporter)
);

// Criação do SDK
const sdk = new NodeSDK({
    resource: resource,
    traceExporter: traceExporter,
    instrumentations: [
        getNodeAutoInstrumentations({
            // Desabilita instrumentações não necessárias para melhor performance
            '@opentelemetry/instrumentation-http': {
                enabled: true
            },
            '@opentelemetry/instrumentation-express': {
                enabled: true
            },
            // Desabilita todas as outras instrumentações
            '@opentelemetry/instrumentation-aws-sdk': { enabled: false },
            '@opentelemetry/instrumentation-mongodb': { enabled: false },
            // Adicione outras que não são necessárias
        })
    ],
    loggerProvider: loggerProvider,
});

// Função para registrar logs
function registerLog(level, message, attributes = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - [${level.toUpperCase()}] ${message} ${JSON.stringify(attributes)}`;
    
    // Console
    console.log(logEntry);
    
    // Arquivo
    try {
        const logsDir = path.join(__dirname, '../logs');
        if (!fs.existsSync(logsDir)) {
            fs.mkdirSync(logsDir, { recursive: true });
        }
        fs.appendFileSync(path.join(logsDir, 'execution.log'), logEntry + '\n');
    } catch (error) {
        console.error('Erro ao gravar log:', error);
    }
    
    // OpenTelemetry
    const logger = loggerProvider.getLogger('default');
    logger.emit({
        body: message,
        severityNumber: level === 'error' ? 16 : (level === 'warn' ? 13 : 9),
        severityText: level.toUpperCase(),
        attributes: {
            ...attributes,
            'timestamp': timestamp,
        },
    });
}

// Inicializa o SDK
async function initializeTelemetry() {
    try {
        await sdk.start();
        registerLog('info', 'OpenTelemetry SDK inicializado com sucesso');
        return { registerLog, loggerProvider };
    } catch (error) {
        registerLog('error', 'Falha ao inicializar OpenTelemetry SDK', { error: error.message });
        // Fallback para logs sem OpenTelemetry
        return { 
            registerLog, 
            loggerProvider: {
                getLogger: () => ({
                    emit: () => {}
                })
            }
        };
    }
}

// Função para desligar o SDK
async function shutdownTelemetry() {
    try {
        await sdk.shutdown();
        registerLog('info', 'OpenTelemetry SDK encerrado');
    } catch (error) {
        registerLog('error', 'Erro ao encerrar OpenTelemetry SDK', { error: error.message });
    }
}

// Configura o handler para desligamento gracioso
process.on('SIGTERM', shutdownTelemetry);
process.on('SIGINT', shutdownTelemetry);

module.exports = {
    initializeTelemetry,
    shutdownTelemetry,
    registerLog,
    loggerProvider
};