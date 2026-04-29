/**
 * ai-service — Express
 * Responsibilities: GPT-4o spending analysis, anomaly detection,
 *                   weekly report generation
 * Port: 4003
 */
import { createExpressApp } from "@neuralpay/config/express";

const PORT = Number(process.env.PORT) || 4003;
const app = createExpressApp({ serviceName: "ai-service", port: PORT });

// TODO: Mount reportsRouter to generate scheduled and on-demand spending reports.
// app.use("/reports", reportsRouter);
// TODO: Mount anomaliesRouter for anomaly detection requests and feedback loops.
// app.use("/anomalies", anomaliesRouter);
// TODO: Mount coachRouter for conversational AI coaching sessions.
// app.use("/coach", coachRouter);

app.listen(PORT, () => {
  console.log(`🚀 ai-service running on http://localhost:${PORT}`);
});
