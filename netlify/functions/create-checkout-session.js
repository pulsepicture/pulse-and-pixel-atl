const Stripe = require("stripe");

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_PRICE_ID_LINK, quantity: 1 }],
      payment_method_types: ["card", "cashapp"],
      metadata: { token: body.token, eventId: body.eventId, clientName: body.clientName },
      success_url: `${body.returnBase}?g=${body.token}&paid=1`,
      cancel_url: `${body.returnBase}?g=${body.token}&canceled=1`
    });

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};
