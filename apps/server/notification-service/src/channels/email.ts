export async function sendEmail(
  userId: string,
  subject: string,
  _body: string,
) {
  console.log(`[email] to ${userId}: ${subject}`);
}
