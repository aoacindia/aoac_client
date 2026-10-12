import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | AOAC",
  description:
    "Contact Allahabad Organic Agricultural Company Private Limited about products, orders, and shipping. Email hello@aoac.in.",
  alternates: { canonical: "/contact" },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
