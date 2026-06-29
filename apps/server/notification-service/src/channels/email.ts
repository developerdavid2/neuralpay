export async function sendEmail(userId: string, subject: string, body: string) {
  console.log(`[email] to ${userId}: ${subject}`);
}
