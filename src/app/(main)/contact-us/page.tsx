import type { Metadata } from "next";
import AboutPageHeader from "@/components/about/AboutPageHeader";
import ContactDetails from "@/components/contact/ContactDetails";
import ContactForm from "@/components/contact/ContactForm";
import ContactMap from "@/components/contact/ContactMap";
import { defaultContactHeader } from "@/components/contact/contact-defaults";
import PageBlocks from "@/components/blocks/PageBlocks";
import { getPublishedPage } from "@/lib/get-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us | Cooperative Bank Tanzania",
  description: "Reach Cooperative Bank Tanzania by phone, email, or through our contact form.",
};

export default async function ContactUsPage() {
  const page = await getPublishedPage("contact-us");
  if (page) return <PageBlocks blocks={page.layout} />;
  return (
    <>
      <AboutPageHeader {...defaultContactHeader} />
      <ContactDetails />
      <ContactForm />
      <ContactMap />
    </>
  );
}
