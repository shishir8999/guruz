import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { WelcomePopup } from "@/components/WelcomePopup";
import { PetalRain } from "@/components/PetalRain";

const SIGNUP_WELCOME_PENDING_KEY = "guruz_signup_welcome_pending";
const SIGNUP_WELCOME_EVENT = "guruz:signup-welcome";

export function hasPendingSignupWelcome() {
  return typeof window !== "undefined" && window.sessionStorage.getItem(SIGNUP_WELCOME_PENDING_KEY) === "1";
}

export function markSignupWelcomePending() {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SIGNUP_WELCOME_PENDING_KEY, "1");
}

export function clearSignupWelcomePending() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SIGNUP_WELCOME_PENDING_KEY);
}

export function triggerSignupWelcome() {
  if (typeof window === "undefined") return;
  markSignupWelcomePending();
  window.dispatchEvent(new Event(SIGNUP_WELCOME_EVENT));
}

export function SignupWelcomeCelebration() {
  const [open, setOpen] = useState(false);
  const nav = useNavigate();

  useEffect(() => {
    const show = () => setOpen(true);
    if (hasPendingSignupWelcome()) show();
    window.addEventListener(SIGNUP_WELCOME_EVENT, show);
    return () => window.removeEventListener(SIGNUP_WELCOME_EVENT, show);
  }, []);

  function close() {
    clearSignupWelcomePending();
    setOpen(false);
    if (window.location.pathname === "/login") nav({ to: "/", replace: true });
  }

  return (
    <>
      <WelcomePopup open={open} onClose={close} />
      <PetalRain active={open} count={90} />
    </>
  );
}