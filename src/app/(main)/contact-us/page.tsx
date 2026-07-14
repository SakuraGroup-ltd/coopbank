import type { Metadata } from "next";
import AboutPageHeader from "@/components/about/AboutPageHeader";
import ContactDetails from "@/components/contact/ContactDetails";
import ContactForm from "@/components/contact/ContactForm";
import ContactMap from "@/components/contact/ContactMap";
import { defaultContactHeader } from "@/components/contact/contact-defaults";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us | Cooperative Bank Tanzania",
  description: "Reach Cooperative Bank Tanzania by phone, email, or through our contact form.",
};

export default function ContactUsPage() {
  return (
    <>
      <AboutPageHeader {...defaultContactHeader} />
      <ContactDetails />
      <ContactForm />
      <ContactMap />
    </>
  );
}
