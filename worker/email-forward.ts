interface ForwardEnv { FORWARD_TO_EMAILS?: string }

export async function forwardIncoming(message: ForwardableEmailMessage, env: ForwardEnv): Promise<void> {
  if (message.to.toLowerCase() !== 'info@zajickuv-med.cz') {
    message.setReject('Recipient not configured');
    return;
  }
  let recipients: string[];
  try {
    const parsed: unknown = JSON.parse(env.FORWARD_TO_EMAILS ?? '');
    if (!Array.isArray(parsed) || parsed.length < 1 || parsed.length > 5 ||
        parsed.some((v) => typeof v !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || v.toLowerCase().endsWith('@zajickuv-med.cz'))) throw new Error();
    recipients = [...new Set((parsed as string[]).map((v) => v.toLowerCase()))];
  } catch { throw new Error('Invalid forwarding configuration'); }
  const results = await Promise.allSettled(recipients.map((recipient) => message.forward(recipient)));
  const successes = results.filter((r) => r.status === 'fulfilled').length;
  // Pending verification must not cancel forwarding to the verified recipient.
  if (!successes) throw new Error('All email forwards failed');
  if (successes !== recipients.length) console.warn('email_forward_partial', { accepted: successes, configured: recipients.length });
}

export default {
  email: forwardIncoming,
  async fetch(): Promise<Response> { return new Response('Not found', { status: 404 }); },
};
