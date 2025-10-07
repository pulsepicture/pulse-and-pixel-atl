const Stripe = require("stripe");

// Map /api/stripe-webhook to this function
exports.config = { path: "/api/stripe-webhook" };

exports.handler = async (event) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = event.headers["stripe-signature"];

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return { statusCode: 400, body: `Webhook Error: ${err.message}` };
  }

  if (stripeEvent.type === "checkout.session.completed") {
    // const session = stripeEvent.data.object;
    // (Optionnel) marquer le lien comme "unlocked" en DB/KV via session.metadata.token
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
