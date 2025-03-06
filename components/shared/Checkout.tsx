"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";

import { toast } from "sonner"
import { checkoutCredits } from "@/lib/actions/transaction.action";

import { Button } from "../ui/button";

const Checkout = ({
  plan,
  amount,
  credits,
  buyerId,
}: {
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) => {

  useEffect(() => {
    loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }, []);

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      toast(
        <>
          <strong>Order placed!</strong>
          <p>You will receive an email confirmation</p>
        </>,
        {
          duration: 5000,
          className: "success-toast",
        }
      );
      toast(
        <>
          <strong>Order canceled!</strong>
          <p>Continue to shop around and checkout when you're ready</p>
        </>,
        {
          duration: 5000,
          className: "error-toast",
        }
      );
    }
  }, []);

  const onCheckout = async () => {
    const transaction = {
      plan,
      amount,
      credits,
      buyerId,
    };

    await checkoutCredits(transaction);
  };

  return (
    <form action={onCheckout} method="POST">
      <section>
        <Button
          type="submit"
          role="link"
          className="w-full rounded-full bg-purple-gradient bg-cover"
        >
          Buy Credit
        </Button>
      </section>
    </form>
  );
};

export default Checkout;