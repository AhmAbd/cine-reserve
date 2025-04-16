<<<<<<< HEAD
import '@styles/globals.css'

import { title } from 'process'

export const metadata = {
  title: "test",
  description: "Test"
}

const layout = () => {
  return (
    <div>layout</div>
  )
}

export default layout
=======
'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import '../styles/globals.css'; // İlgili stil dosyanızı buraya ekleyin

// Stripe Publishable Key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Layout({ children }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
>>>>>>> 546cdca91d6183d025495619f1f0bb3a73cc6458
