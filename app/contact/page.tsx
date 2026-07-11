import { ContactPageContent } from "@/components/ContactPageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Soumik Belel — open to roles and collaborations in data, markets, and product.",
};

export default function ContactPage() {
  return <ContactPageContent />;
}
