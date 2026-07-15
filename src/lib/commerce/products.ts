export type ProductKind = "blank-template" | "historical-chart" | "subscription" | "lifetime" | "export-credit";

export type LegacyProduct = {
  id: string;
  kind: ProductKind;
  name: string;
  priceGbp: number;
  interval?: "month" | "year";
  description: string;
  features: string[];
  includedPdfCredits?: number;
  includedHistoricalCredits?: number;
};

export const PRODUCTS: LegacyProduct[] = [
  {
    id: "blank-template",
    kind: "blank-template",
    name: "Blank Template Unlock",
    priceGbp: 3.99,
    description: "Own one clean blank wall-chart template forever.",
    features: ["Watermark-free PDF for one template", "Unlimited edits", "Unlimited personal prints", "Custom background support"],
  },
  {
    id: "historical-chart",
    kind: "historical-chart",
    name: "Historical Filled Chart",
    priceGbp: 6.99,
    description: "A completed season chart, ready to print and keep.",
    features: ["Watermark-free historical chart", "Printable PDF", "Filled teams/results", "Owned forever"],
  },
  {
    id: "pro-monthly",
    kind: "subscription",
    name: "Pro Monthly",
    priceGbp: 14.99,
    interval: "month",
    description: "Monthly creator access for active collectors and designers.",
    includedPdfCredits: 10,
    includedHistoricalCredits: 5,
    features: ["Unlimited blank templates", "10 clean PDF exports/month", "5 historical chart downloads/month", "AI Historical Chart Fill", "Premium backgrounds", "Cloud saves"],
  },
  {
    id: "pro-yearly",
    kind: "subscription",
    name: "Pro Yearly",
    priceGbp: 149.99,
    interval: "year",
    description: "12 months for the price of 10.",
    includedPdfCredits: 120,
    includedHistoricalCredits: 60,
    features: ["Everything in Pro Monthly", "AI Historical Chart Fill", "Two months free", "Annual PDF/historical allowance", "Priority new templates"],
  },
  {
    id: "lifetime",
    kind: "lifetime",
    name: "Lifetime Unlock",
    priceGbp: 249.99,
    description: "Permanent access to the editor and premium blank templates.",
    features: ["Lifetime blank-template access", "AI Historical Chart Fill", "Premium backgrounds", "Cloud saves", "Clean PDF exports subject to fair use"],
  },
];

export function productById(id?: string | null) {
  return PRODUCTS.find((product) => product.id === id) ?? PRODUCTS[2];
}

export function formatGbp(amount: number) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(amount);
}
