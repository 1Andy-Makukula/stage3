// server/services/paymentService.ts
export const initiatePayment = async (amount: number, email: string, name: string) => {
    const response = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tx_ref: `tx-${Date.now()}`,
            amount,
            currency: 'ZMW',
            redirect_url: 'https://your-app.com/callback',
            customer: { email, name },
            customizations: { title: 'App Purchase' },
        }),
    });
    return response.json();
};