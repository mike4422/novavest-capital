export const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "ar", label: "العربية" }
];

export const dictionary = {
  en: {
    startInvesting: "Start Investing",
    viewPlans: "View Plans",
    deposit: "Deposit",
    withdraw: "Withdraw",
    investments: "Investments"
  },
  es: {
    startInvesting: "Comenzar inversión",
    viewPlans: "Ver planes",
    deposit: "Depositar",
    withdraw: "Retirar",
    investments: "Inversiones"
  }
};

export type LanguageCode = keyof typeof dictionary;
