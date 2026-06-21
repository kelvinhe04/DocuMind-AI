import type { Appearance } from "@clerk/nextjs/server";

export const clerkDarkAppearance: Appearance = {
  variables: {
    colorBackground: "#0f172a",
    colorInputBackground: "#1e293b",
    colorText: "#f1f5f9",
    colorTextSecondary: "#94a3b8",
    colorTextOnPrimaryBackground: "#ffffff",
    colorPrimary: "#7c3aed",
    colorDanger: "#f87171",
    colorSuccess: "#34d399",
    colorNeutral: "#475569",
    colorInputText: "#f1f5f9",
    borderRadius: "0.875rem",
    fontFamily: "inherit",
    fontSize: "14px",
  },
  elements: {
    // Sign-in/up card
    card: "shadow-none",
    cardBox: "shadow-none",
    headerTitle: "text-white font-bold tracking-tight",
    headerSubtitle: "text-slate-400",
    socialButtonsBlockButton: "border-slate-700/60 bg-slate-800/80 hover:bg-slate-800 text-slate-200",
    socialButtonsBlockButtonText: "font-medium text-slate-200",
    dividerLine: "bg-slate-800",
    dividerText: "text-slate-500",
    formFieldLabel: "text-slate-400 text-xs font-medium",
    formFieldInput: "rounded-xl",
    formButtonPrimary: "rounded-xl font-semibold shadow-none",
    footerActionText: "text-slate-500",
    footerActionLink: "text-violet-400 hover:text-violet-300 font-medium",
    alertText: "text-red-300",

    // UserButton popover
    userButtonPopoverCard: "rounded-2xl",
    userPreviewMainIdentifier: "text-slate-100 font-semibold",
    userPreviewSecondaryIdentifier: "text-slate-400",
    userButtonPopoverActionButton: "text-slate-200 rounded-xl",
    userButtonPopoverActionButtonText: "text-slate-200 font-medium",
    userButtonPopoverActionButtonIcon: "text-slate-500",
    userButtonPopoverFooter: "hidden",
    avatarBox: "rounded-full",
  },
};
