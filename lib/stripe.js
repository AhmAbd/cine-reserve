// lib/stripe.js
import { loadStripe } from '@stripe/stripe-js';

// Stripe publishable key, .env.local dosyasından alınacak
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export { stripePromise };