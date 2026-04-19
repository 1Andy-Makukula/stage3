type SmsProvider = 'twilio' | 'africasTalking';

interface SmsPayload {
  to: string;
  message: string;
  provider: SmsProvider;
}

function normalizeZmPhone(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('260')) return `+${digits}`;
  if (digits.startsWith('0')) return `+260${digits.slice(1)}`;
  return `+${digits}`;
}

async function sendViaTwilio(payload: Omit<SmsPayload, 'provider'>): Promise<void> {
  const normalized = normalizeZmPhone(payload.to);
  const body = {
    to: normalized,
    from: process.env.TWILIO_FROM_NUMBER ?? 'TWILIO_FROM_NOT_SET',
    body: payload.message,
  };

  console.log(`[SMS/Twilio] SMS Sent to ${normalized}: ${payload.message}`);
  console.log('[SMS/Twilio] Payload:', body);

  // Real execution (enable when credentials are provisioned):
  // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  // await client.messages.create(body);
}

async function sendViaAfricasTalking(payload: Omit<SmsPayload, 'provider'>): Promise<void> {
  const normalized = normalizeZmPhone(payload.to);
  const body = {
    username: process.env.AT_USERNAME ?? 'sandbox',
    to: [normalized],
    message: payload.message,
    from: process.env.AT_SENDER_ID,
  };

  console.log(`[SMS/Africa's Talking] SMS Sent to ${normalized}: ${payload.message}`);
  console.log("[SMS/Africa's Talking] Payload:", body);

  // Real execution (enable when credentials are provisioned):
  // const africasTalking = require('africastalking')({
  //   apiKey: process.env.AT_API_KEY,
  //   username: process.env.AT_USERNAME ?? 'sandbox',
  // });
  // await africasTalking.SMS.send(body);
}

export async function sendSms(
  to: string,
  message: string,
  provider: SmsProvider = (process.env.SMS_PROVIDER as SmsProvider) || 'africasTalking'
): Promise<void> {
  if (!to || !message) return;
  if (provider === 'twilio') {
    await sendViaTwilio({ to, message });
    return;
  }
  await sendViaAfricasTalking({ to, message });
}

export async function sendRecipientPurchaseSms(recipientPhone: string, buyerName: string, productTitle: string, claimCode: string): Promise<void> {
  const message = `${buyerName} just bought you ${productTitle}! Claim code: ${claimCode}`;
  await sendSms(recipientPhone, message);
}

export async function sendMerchantEscrowSms(merchantPhone: string, productTitle: string): Promise<void> {
  const message = `New Escrow Locked: ${productTitle}`;
  await sendSms(merchantPhone, message);
}
