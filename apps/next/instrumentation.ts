// Temporarily disable OpenTelemetry instrumentation to fix grpc-js issues
export const register = async () => {
  // OpenTelemetry disabled for development
};

/* Disabled temporarily due to grpc-js module issues
import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';

// Only initialize SDK in production or when explicitly enabled.
if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  // Enable basic internal diagnostics at warn level
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.WARN);

  import('@opentelemetry/sdk-node')
    .then(async ({ NodeSDK }) => {
      const { Resource } = await import('@opentelemetry/resources');
      const { SemanticResourceAttributes } = await import(
        '@opentelemetry/semantic-conventions'
      );
      const { OTLPTraceExporter } = await import(
        '@opentelemetry/exporter-trace-otlp-http'
      );
      const { getNodeAutoInstrumentations } = await import(
        '@opentelemetry/auto-instrumentations-node'
      );

      const resource = new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]:
          process.env.OTEL_SERVICE_NAME || 'next-app',
        [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]:
          process.env.NODE_ENV || 'development',
      });

      const traceExporter = new OTLPTraceExporter({
        // Uses OTEL_EXPORTER_OTLP_ENDPOINT and OTEL_EXPORTER_OTLP_HEADERS if provided
      });

      const sdk = new NodeSDK({
        resource,
        traceExporter,
        instrumentations: [getNodeAutoInstrumentations()],
      });

      await sdk.start();

      // Graceful shutdown
      process.on('SIGTERM', async () => {
        await sdk.shutdown();
      });
      process.on('SIGINT', async () => {
        await sdk.shutdown();
      });
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error('[otel] failed to initialize', err);
    });
}
*/
