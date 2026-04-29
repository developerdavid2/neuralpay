type ServiceTarget = {
  name: string;
  port: number;
};

const services: ServiceTarget[] = [
  { name: "api-gateway", port: 4000 },
  { name: "user-service", port: 4001 },
  { name: "payment-service", port: 4002 },
  { name: "ai-service", port: 4003 },
  { name: "notification-service", port: 4004 },
];

const color = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

const pad = (value: string, width: number) => value.padEnd(width, " ");

const checks = async () => {
  return Promise.allSettled(
    services.map(async (service) => {
      const url = `http://127.0.0.1:${service.port}/health`;
      const response = await fetch(url);
      const body = (await response.json()) as unknown;

      return {
        ...service,
        url,
        ok: response.ok,
        statusCode: response.status,
        body,
      };
    }),
  );
};

console.log(`${color.cyan}NeuralPay Backend Health Check${color.reset}`);
console.log(
  [
    pad("SERVICE", 24),
    pad("PORT", 8),
    pad("STATUS", 10),
    pad("HTTP", 8),
    "DETAILS",
  ].join(" | "),
);
console.log("-".repeat(78));

let hasFailure = false;

export async function result() {
  (await checks()).forEach((result, index) => {
    const service = services[index];
    if (!service) {
      return;
    }

    if (result.status === "fulfilled") {
      const status = result.value.ok ? "UP" : "DOWN";
      const statusColor = result.value.ok ? color.green : color.red;
      if (!result.value.ok) hasFailure = true;

      console.log(
        [
          pad(service.name, 24),
          pad(String(service.port), 8),
          pad(`${statusColor}${status}${color.reset}`, 10),
          pad(String(result.value.statusCode), 8),
          JSON.stringify(result.value.body),
        ].join(" | "),
      );
      return;
    }

    hasFailure = true;
    const message =
      result.reason instanceof Error
        ? result.reason.message
        : String(result.reason);

    console.log(
      [
        pad(service.name, 24),
        pad(String(service.port), 8),
        pad(`${color.red}DOWN${color.reset}`, 10),
        pad("-", 8),
        message,
      ].join(" | "),
    );
  });

  if (hasFailure) {
    console.log(`\n${color.yellow}Some services are down.${color.reset}`);
    process.exitCode = 1;
  } else {
    console.log(`\n${color.green}All services are healthy.${color.reset}`);
  }
}
