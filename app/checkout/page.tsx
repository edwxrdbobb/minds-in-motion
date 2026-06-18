"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, ArrowLeft, Heart, ChevronRight, Globe, Loader2, Lock } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import {
  CheckoutElementsProvider,
  PaymentElement,
  useCheckout,
} from "@stripe/react-stripe-js/checkout";

const donationAmounts = [10, 25, 50, 100, 250];
const steps = ["Amount", "Details", "Confirm"];

const stagger = {
  animate: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

function PaymentForm({
  form,
  finalAmount,
  onSuccess,
  onBack,
}: {
  form: { name: string; email: string; message: string };
  finalAmount: number;
  onSuccess: () => void;
  onBack: () => void;
}) {
  const checkout = useCheckout();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // useCheckout returns { type: "loading" } until the session is ready
  const isReady = checkout.type !== "loading";

  const handleConfirm = async () => {
    if (!isReady) return;
    setLoading(true);
    setError("");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (checkout as any).confirm() as
      | { type: "success" }
      | { type: "redirect"; url: string }
      | { type: "error"; error: { message?: string } };

    if (result.type === "error") {
      setError(result.error.message ?? "Payment failed. Please try again.");
      setLoading(false);
    } else if (result.type === "success") {
      onSuccess();
    }
    // type === "redirect" → Stripe auto-navigates to the return_url
  };

  return (
    <>
      <div className="mb-6">
        <PaymentElement options={{ layout: "tabs" }} />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200/60 rounded-xl px-5 py-3.5 mb-5">
          <p className="text-xs text-red-700 font-medium">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-5">
        <Lock className="w-3 h-3" />
        Secured by Stripe
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
          className="flex-1 h-12 rounded-xl border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-200"
        >
          Edit details
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={loading || !isReady}
          className="flex-1 h-12 bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-semibold shadow-lg shadow-gray-900/20 transition-all duration-200 hover:shadow-xl hover:shadow-gray-900/25 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Donate £{finalAmount}
              <CheckCircle className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "confirm" | "success">("form");
  const [amount, setAmount] = useState(25);
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sessionConfig, setSessionConfig] = useState<{
    clientSecret: string;
    publishableKey: string;
  } | null>(null);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [sessionError, setSessionError] = useState("");

  const finalAmount = amount > 0 ? amount : Number(customAmount) || 0;
  const stepIndex = step === "form" ? 0 : step === "confirm" ? 1 : 2;

  // Handle return from 3DS / redirect-based payment methods
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("session_id")) {
      setStep("success");
    }
  }, []);

  const stripePromise = useMemo(
    () => (sessionConfig ? loadStripe(sessionConfig.publishableKey) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionConfig?.publishableKey]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0) return;

    setSessionLoading(true);
    setSessionError("");

    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          name: form.name,
          email: form.email,
          message: form.message,
          origin: window.location.origin,
        }),
      });

      if (!res.ok) throw new Error("Failed to initialize payment");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSessionConfig(data);
      setStep("confirm");
    } catch {
      setSessionError("Could not start payment. Please try again.");
    } finally {
      setSessionLoading(false);
    }
  };

  const handleBack = () => {
    setSessionConfig(null);
    setStep("form");
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Subtle chessboard background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.015]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              "repeating-conic-gradient(#000 0% 25%, transparent 0% 50%)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-16">
        {/* Back link */}
        <motion.button
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/")}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Back to home
        </motion.button>

        {/* Progress indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-0 mb-10"
        >
          {steps.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 ${
                    i <= stepIndex
                      ? "bg-gray-900 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {i < stepIndex ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={`text-[11px] mt-1.5 font-medium transition-colors duration-300 ${
                    i <= stepIndex ? "text-gray-900" : "text-gray-300"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-12 sm:w-20 h-px mx-2 sm:mx-3 mb-5 transition-colors duration-500 ${
                    i < stepIndex ? "bg-gray-900" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </motion.div>

        {/* Card container */}
        <motion.div
          layout
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-10"
        >
          <AnimatePresence mode="wait">
            {step === "form" && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-9">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Heart className="w-6 h-6 text-gray-900" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Support Minds in Motion
                  </h1>
                  <p className="text-gray-500 mt-2 text-sm sm:text-base leading-relaxed">
                    Your contribution brings chess programs to communities in Nepal, Ghana, and beyond.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-7">
                  <motion.div variants={stagger} initial="initial" animate="animate">
                    <motion.div variants={fadeUp}>
                      <Label className="text-sm font-semibold text-gray-900">Choose an amount</Label>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 mt-3">
                        {donationAmounts.map((donationAmount) => (
                          <button
                            key={donationAmount}
                            type="button"
                            onClick={() => { setAmount(donationAmount); setCustomAmount(""); }}
                            className={`py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                              amount === donationAmount && !customAmount
                                ? "bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-105"
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-100"
                            }`}
                          >
                            £{donationAmount}
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div variants={fadeUp} className="mt-3">
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                          £
                        </span>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Custom amount"
                          value={customAmount}
                          onChange={(e) => { setCustomAmount(e.target.value); setAmount(0); }}
                          className="pl-8 h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-300"
                        />
                      </div>
                    </motion.div>
                  </motion.div>

                  <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-5">
                    <motion.div variants={fadeUp} className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-900">
                        Full name
                      </Label>
                      <Input
                        id="name"
                        required
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-300"
                      />
                    </motion.div>

                    <motion.div variants={fadeUp} className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-gray-900">
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="h-12 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-300"
                      />
                    </motion.div>

                    <motion.div variants={fadeUp} className="space-y-2">
                      <Label htmlFor="message" className="text-sm font-semibold text-gray-900">
                        Message <span className="text-gray-400 font-normal">(optional)</span>
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Add a personal note..."
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="h-20 rounded-xl border-gray-200 bg-gray-50 focus:bg-white transition-colors placeholder:text-gray-300 resize-none"
                      />
                    </motion.div>
                  </motion.div>

                  {sessionError && (
                    <div className="bg-red-50 border border-red-200/60 rounded-xl px-5 py-3.5">
                      <p className="text-xs text-red-700 font-medium">{sessionError}</p>
                    </div>
                  )}

                  <motion.div variants={fadeUp}>
                    <Button
                      type="submit"
                      disabled={sessionLoading || finalAmount <= 0}
                      className="w-full h-13 bg-gray-900 text-white hover:bg-gray-800 rounded-xl text-base font-semibold shadow-lg shadow-gray-900/20 transition-all duration-200 hover:shadow-xl hover:shadow-gray-900/25 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {sessionLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Preparing...
                        </>
                      ) : (
                        <>
                          Continue to review
                          <ChevronRight className="w-4 h-4 ml-1.5" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            )}

            {step === "confirm" && sessionConfig && stripePromise && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center mb-8">
                  <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <Globe className="w-6 h-6 text-gray-900" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    Almost there
                  </h1>
                  <p className="text-gray-500 mt-2 text-sm">
                    Review your donation and enter payment details below.
                  </p>
                </div>

                <div className="bg-gray-50/80 rounded-2xl p-6 sm:p-8 space-y-5 mb-8 border border-gray-100">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                    <span className="text-sm text-gray-500 font-medium">Donation amount</span>
                    <span className="text-2xl font-bold text-gray-900">£{finalAmount}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Name</span>
                      <span className="font-semibold text-gray-900">{form.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Email</span>
                      <span className="font-semibold text-gray-900">{form.email}</span>
                    </div>
                    {form.message && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Message</span>
                        <span className="font-semibold text-gray-900 text-right max-w-[200px]">
                          {form.message}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <CheckoutElementsProvider
                  stripe={stripePromise}
                  options={{ clientSecret: sessionConfig.clientSecret }}
                >
                  <PaymentForm
                    form={form}
                    finalAmount={finalAmount}
                    onSuccess={() => setStep("success")}
                    onBack={handleBack}
                  />
                </CheckoutElementsProvider>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
                  className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </motion.div>

                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 2.2 + i * 0.6, opacity: 0 }}
                    transition={{ duration: 1.2, delay: 0.2 + i * 0.3, ease: "easeOut" }}
                    className="absolute top-[88px] left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 border-green-200 pointer-events-none"
                  />
                ))}

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-3xl font-bold text-gray-900 mb-2"
                >
                  Thank you!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="text-gray-500 mb-1"
                >
                  Your donation of <strong className="text-gray-900">£{finalAmount}</strong> has been received.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  className="text-gray-400 text-sm mb-10"
                >
                  A confirmation receipt has been sent to {form.email}.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                >
                  <Button
                    onClick={() => router.push("/")}
                    className="h-12 px-10 bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-semibold shadow-lg shadow-gray-900/20 transition-all duration-200 hover:shadow-xl hover:shadow-gray-900/25 hover:-translate-y-0.5"
                  >
                    Back to home
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-300 mt-8"
        >
          Minds in Motion &middot; 501(c)(3) nonprofit
        </motion.p>
      </div>
    </div>
  );
}
