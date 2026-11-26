"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "@/lib/i18n/navigation";
import { AmountPicker } from "@/components/donate/AmountPicker";
import { Button } from "@/components/ui/Button";
import { Turnstile } from "@/components/ui/Turnstile";
import { trackEvent } from "@/lib/analytics/track";

export function PledgeForm({
  campaignSlug,
  inKindAccepted,
  cardPaymentsEnabled,
}: {
  campaignSlug: string;
  inKindAccepted: boolean;
  cardPaymentsEnabled: boolean;
}) {
  const t = useTranslations("donate");
  const locale = useLocale() as "fr" | "ar" | "en";
  const router = useRouter();

  const [amount, setAmount] = useState<number | null>(null);
  const [kind, setKind] = useState<"money" | "in-kind">("money");
  const [paymentMethod, setPaymentMethod] = useState<"bank-transfer" | "card">(
    "bank-transfer",
  );
  const [inKindDescription, setInKindDescription] = useState("");
  const [donorName, setDonorName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (kind === "money" && (!amount || amount <= 0)) {
      setError(t("amountLabel"));
      return;
    }
    if (!consent) {
      setError(t("consentLabel"));
      return;
    }

    setSubmitting(true);
    // Generated here (an event handler), not during render, since a stable
    // random/time-based value can't be computed inside render itself.
    const idempotencyKey =
      typeof crypto !== "undefined"
        ? crypto.randomUUID()
        : Math.random().toString(36);
    try {
      const res = await fetch("/api/pledges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignSlug,
          amountMAD: kind === "money" ? amount : 1,
          kind,
          inKindDescription: kind === "in-kind" ? inKindDescription : undefined,
          donorName: donorName || undefined,
          anonymous,
          email: email || undefined,
          phone: phone || undefined,
          message: message || undefined,
          paymentMethod: kind === "money" ? paymentMethod : "bank-transfer",
          locale,
          idempotencyKey,
          turnstileToken: turnstileToken || "dev-no-turnstile-configured",
          website,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error");
        setSubmitting(false);
        return;
      }
      trackEvent("pledge_submitted", { campaignSlug });
      if (data.checkoutUrl) {
        // Full browser redirect to Stripe-hosted Checkout.
        window.location.href = data.checkoutUrl;
        return;
      }
      // No-database mode returns no reference for bank/in-kind gifts.
      router.push(
        data.reference
          ? `/donate/thanks?ref=${encodeURIComponent(data.reference)}&campaign=${campaignSlug}`
          : `/donate/thanks?method=${data.method === "in-kind" ? "in-kind" : "bank"}&campaign=${campaignSlug}`,
      );
    } catch {
      setError("Network error");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Honeypot: hidden from real users, bots fill every field. */}
      <input
        type="text"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      {inKindAccepted && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={kind === "in-kind"}
            onChange={(e) => setKind(e.target.checked ? "in-kind" : "money")}
          />
          {t("inKind")}
        </label>
      )}

      {kind === "money" ? (
        <div>
          <label className="mb-1 block text-sm font-medium">
            {t("amountLabel")}
          </label>
          <AmountPicker
            value={amount}
            onChange={(a) => {
              setAmount(a);
              trackEvent("amount_selected", { amount: a });
            }}
            customLabel={t("customAmount")}
          />

          {cardPaymentsEnabled && (
            <div className="mt-4">
              <span className="mb-1 block text-sm font-medium">
                {t("paymentMethodLabel")}
              </span>
              <div className="flex gap-4 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "bank-transfer"}
                    onChange={() => setPaymentMethod("bank-transfer")}
                  />
                  {t("paymentMethodBank")}
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === "card"}
                    onChange={() => setPaymentMethod("card")}
                  />
                  {t("paymentMethodCard")}
                </label>
              </div>
              {paymentMethod === "card" && (
                <p className="text-muted mt-1 text-xs">
                  {t("cardRedirectNotice")}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="inKindDescription"
          >
            {t("inKindDescriptionLabel")}
          </label>
          <textarea
            id="inKindDescription"
            value={inKindDescription}
            onChange={(e) => setInKindDescription(e.target.value)}
            className="w-full rounded-md border border-black/10 p-3"
            rows={3}
          />
        </div>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={anonymous}
          onChange={(e) => setAnonymous(e.target.checked)}
        />
        {t("anonymousLabel")}
      </label>

      {!anonymous && (
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="donorName">
            {t("donorNameLabel")}
          </label>
          <input
            id="donorName"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="w-full rounded-md border border-black/10 p-3"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          {t("emailLabel")}
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-black/10 p-3"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="phone">
          {t("phoneLabel")}
        </label>
        <input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-md border border-black/10 p-3"
          dir="ltr"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium" htmlFor="message">
          {t("messageLabel")}
        </label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-md border border-black/10 p-3"
          rows={2}
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          required
        />
        {t("consentLabel")}
      </label>

      <Turnstile onVerify={setTurnstileToken} />

      {error && (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      )}

      <Button type="submit" loading={submitting} disabled={submitting}>
        {submitting
          ? t("submitting")
          : kind === "money" && paymentMethod === "card"
            ? t("payByCard")
            : t("submit")}
      </Button>
    </form>
  );
}
