"use client";

import { useEffect, useRef, useState } from "react";
import {
  GoogleReCaptchaProvider,
  useGoogleReCaptcha,
} from "react-google-recaptcha-v3";
import { useForm } from "react-hook-form";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import gsap from "gsap";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";

import { schema } from "../services/formSchema";

type FormData = z.infer<typeof schema>;

const BTN_TEXT = "Send Message";
const BTN_SENT = "Message Sent";

function SubmitButton({
  isSubmitting,
  isSent,
}: {
  isSubmitting: boolean;
  isSent: boolean;
}) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  const label = isSent ? BTN_SENT : BTN_TEXT;

  useEffect(() => {
    const btn = btnRef.current;
    if (!btn || isSent) return;

    const topChars = btn.querySelectorAll<HTMLElement>(".btn-char-top");
    const botChars = btn.querySelectorAll<HTMLElement>(".btn-char-bot");

    gsap.set(botChars, { yPercent: 100 });

    tlRef.current = gsap
      .timeline({ paused: true })
      .to(topChars, {
        yPercent: -100,
        duration: 0.3,
        ease: "power3.inOut",
        stagger: 0.01,
      })
      .to(
        botChars,
        { yPercent: 0, duration: 0.3, ease: "power3.inOut", stagger: 0.01 },
        "<",
      );

    const onEnter = () => tlRef.current?.play();
    const onLeave = () => tlRef.current?.reverse();

    btn.addEventListener("mouseenter", onEnter);
    btn.addEventListener("mouseleave", onLeave);

    return () => {
      btn.removeEventListener("mouseenter", onEnter);
      btn.removeEventListener("mouseleave", onLeave);
    };
  }, [isSent]);

  return (
    <button
      ref={btnRef}
      type="submit"
      disabled={isSubmitting || isSent}
      className={cn(
        "inline-flex items-center gap-3 border px-8 py-4 font-sans text-sm font-semibold tracking-wide transition-all duration-300 md:px-10 md:py-5 md:text-base",
        isSent
          ? "border-foreground bg-foreground text-background cursor-default"
          : "border-foreground/20 hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40",
      )}
    >
      {isSubmitting ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span className="font-sans text-sm font-semibold tracking-wide md:text-base">
            Sending...
          </span>
        </>
      ) : isSent ? (
        <>
          <CheckCircle2 size={16} />
          <span className="relative flex overflow-hidden">
            <span className="flex">
              {label.split("").map((char, i) => (
                <span key={`s-${i}`} className="inline-block">
                  {char === " " ? "\u00A0" : char}
                </span>
              ))}
            </span>
            <span className="sr-only">{label}</span>
          </span>
        </>
      ) : (
        <span className="relative flex overflow-hidden">
          <span className="flex" aria-hidden>
            {label.split("").map((char, i) => (
              <span key={`t-${i}`} className="btn-char-top inline-block">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
          <span className="absolute inset-0 flex" aria-hidden>
            {label.split("").map((char, i) => (
              <span key={`b-${i}`} className="btn-char-bot inline-block">
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </span>
          <span className="sr-only">{label}</span>
        </span>
      )}
    </button>
  );
}

function ContactFormContent() {
  const [formStatus, setFormStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const { executeRecaptcha } = useGoogleReCaptcha();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    reValidateMode: "onBlur",
    shouldFocusError: false,
  });

  const onSubmit = async (data: FormData) => {
    setFormStatus("idle");

    if (!executeRecaptcha) {
      console.error("Execute recaptcha not yet available");
      return;
    }

    try {
      const captchaToken = await executeRecaptcha("contact_submit");

      if (!captchaToken) {
        setFormStatus("error");
        return;
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, captchaToken }),
      });

      if (!res.ok) throw new Error("Failed to send email");

      setFormStatus("success");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setFormStatus("error");
    }
  };

  const formItems = [
    {
      label: "Name",
      name: "name",
      type: "text",
      placeholder: "Jane Doe",
      register: register("name"),
      error: errors.name,
      required: true,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "jane@doe.com",
      register: register("email"),
      error: errors.email,
      required: true,
    },
    {
      label: "Organization",
      name: "organization",
      type: "text",
      placeholder: "Jane & Doe ©",
      register: register("organization"),
      error: errors.organization,
      required: false,
    },
    {
      label: "Services",
      name: "service",
      type: "text",
      placeholder: "Web Development, Web Design",
      register: register("service"),
      error: errors.service,
      required: false,
    },
    {
      label: "Message",
      name: "message",
      type: "textarea",
      placeholder: "Tell me about your project",
      register: register("message"),
      error: errors.message,
      required: true,
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex w-full flex-col">
      {formItems.map((formItem) => (
        <div
          key={formItem.name}
          className={cn(
            "border-foreground/10 group border-b px-1 py-6 md:py-8",
            formItem.error && "border-b-red-400/60",
          )}
        >
          <label
            htmlFor={formItem.name}
            className="text-foreground mb-3 block font-sans text-[10px] font-semibold tracking-[0.25em] uppercase md:mb-4 md:text-xs"
          >
            {formItem.label}
            {formItem.required && (
              <span className="text-foreground/40 ml-1">*</span>
            )}
          </label>

          {formItem.type === "textarea" ? (
            <textarea
              id={formItem.name}
              {...formItem.register}
              placeholder={formItem.placeholder}
              disabled={isSubmitting}
              rows={4}
              className="text-foreground placeholder:text-foreground/40 block w-full resize-none bg-transparent font-sans text-base leading-relaxed outline-none disabled:opacity-50 md:text-lg"
            />
          ) : (
            <input
              type={formItem.type}
              id={formItem.name}
              {...formItem.register}
              placeholder={formItem.placeholder}
              disabled={isSubmitting}
              className="text-foreground placeholder:text-foreground/40 block w-full bg-transparent font-sans text-base outline-none disabled:opacity-50 md:text-lg"
            />
          )}

          {formItem.error && (
            <p className="mt-3 font-sans text-[11px] font-medium tracking-wider text-red-500 uppercase">
              {formItem.error.message}
            </p>
          )}
        </div>
      ))}

      <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between md:mt-12">
        <SubmitButton
          isSubmitting={isSubmitting}
          isSent={formStatus === "success"}
        />

        {formStatus === "error" && (
          <p className="animate-in fade-in slide-in-from-bottom-2 font-sans text-[11px] font-semibold tracking-[0.2em] text-red-500 uppercase duration-300">
            Something went wrong. Try again
          </p>
        )}
      </div>
      <p className="text-foreground/30 mt-6 font-sans text-[10px] leading-relaxed">
        This site is protected by reCAPTCHA and the Google{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Privacy Policy
        </a>{" "}
        and{" "}
        <a
          href="https://policies.google.com/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Terms of Service
        </a>{" "}
        apply.
      </p>
    </form>
  );
}

export default function ContactForm() {
  return (
    <GoogleReCaptchaProvider
      reCaptchaKey={process.env.NEXT_PUBLIC_GOOGLE_RECAPTCHA_SITE_KEY || ""}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "body",
        nonce: undefined,
      }}
    >
      <ContactFormContent />
    </GoogleReCaptchaProvider>
  );
}
