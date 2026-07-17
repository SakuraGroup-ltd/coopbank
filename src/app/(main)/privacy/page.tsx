import type { Metadata } from "next";
import Link from "next/link";
import { Mail, ShieldCheck, ArrowUpRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Notice | Cooperative Bank Tanzania",
  description:
    "How Cooperative Bank Tanzania Limited collects, uses, shares and protects your personal data under the Personal Data Protection Act 2022.",
};

const DPO_EMAIL = "DataProtectionOfficer@cbtbank.co.tz";

// Section registry — drives both the table of contents and the body, so they
// never drift apart. Legal wording is faithful to the Bank's notice; only
// obvious document-extraction artifacts (run-together words, "Emai:") are fixed.
const sections = [
  {
    id: "who-we-are",
    title: "Who We Are",
    body: [
      'Cooperative Bank of Tanzania Limited ("the Bank") is a licensed commercial bank incorporated in the United Republic of Tanzania and regulated by the Bank of Tanzania. The Bank provides banking and financial services to individuals, businesses, cooperatives and institutions while ensuring that personal data is processed lawfully, fairly and transparently.',
    ],
  },
  {
    id: "scope",
    title: "Scope of this Privacy Notice",
    body: [
      "This Privacy Notice applies to any individual located within or outside the United Republic of Tanzania who enquires about, applies for, purchases or uses the products and services provided by the Bank.",
    ],
  },
  {
    id: "how-we-obtain",
    title: "Ways We Obtain Personal Information",
    body: ["We may collect information about you from the following sources:"],
    subsections: [
      {
        heading: "Information we receive from you",
        body: [
          "We obtain personal information about you through your interactions with us generally, including by telephone calls (which may be recorded, and you will be made aware of the recording before it happens), by email, via our websites, via application (CoopPesa), internet banking, ATMs, social media platforms, or other forms, or face to face (e.g. in meetings). We collect personal information — such as your name, contact details, financial details, employment and education details, nationality, date and place of birth, marital status, biometric information (where applicable), passport or other identification details and details of visits to our premises — that you provide to us when you:",
        ],
        list: [
          "Enquire about our products and services;",
          "Submit applications to open an account; and",
          "Subsequently correspond with us.",
        ],
      },
      {
        heading: "Information we collect about you",
        body: [
          "We collect information about you by monitoring your access to our premises (e.g. CCTV). We also collect information about how you interact with our website, including IP addresses or other device information.",
        ],
      },
      {
        heading: "Information we receive from third parties",
        body: [
          "We receive information about you from third parties (e.g. credit reference agencies).",
        ],
      },
    ],
  },
  {
    id: "how-we-use",
    title: "How We Use Personal Information",
    body: [
      "We process your personal information for the purposes set out in this notice. Different legal grounds apply depending on what category of personal information we process. Standard personal information is normally processed by us on the basis that it is necessary for the performance of a contract, our or a third party's legitimate interests, or law. Further information about this and special-category processing grounds is set out below.",
    ],
    table: {
      head: [
        "We process the following information",
        "For the following purpose(s)",
        "Based on the following justification",
      ],
      rows: [
        [
          "Name, ID Number, Nationality, Passport Information, Tax Details, Date of Birth, Place of Birth, Residential Address, Business Address, Occupation, Signature, Employment History, Education Background, Financial Details, Criminal Records",
          "To facilitate our account opening process, our customer due diligence process and our vendor due diligence process, as well as to prevent fraud and abuse of our services.",
          "Necessary to perform our contract, to comply with our regulatory requirements, and more generally in order to pursue our legitimate interest of managing our administrative and business operations and complying with internal policies and procedures.",
        ],
        [
          "Financial and Transactional (e.g. details about your accounts with us and payments to and from your accounts with us)",
          "To enable us to process your transactions. To fulfil our Regulatory Reporting processes and facilitate fraud case handling and reporting (where required).",
          "Necessary to perform our contract, to comply with our regulatory requirements, and more generally in order to pursue our legitimate interests.",
        ],
        [
          "Telephone Calls",
          "Monitoring of regulated activities, training and development.",
          "To comply with our regulatory requirements and to pursue our legitimate interest to enhance the quality of our service.",
        ],
        [
          "Particulars of any complaints",
          "To facilitate complaints handling and reporting.",
          "To comply with our regulatory requirements.",
        ],
      ],
    },
  },
  {
    id: "minors",
    title: "Managing Minors' Information",
    body: [
      "We recognise the importance of safeguarding personal data related to minors. If we collect information about individuals under the age of 18, we do so only with the consent of a parent or guardian. We encourage parents and guardians to be actively involved in their children's online activities.",
      "When collecting images of minors:",
    ],
    list: [
      "Explicit consent from a parent or guardian is sought before capturing or using photographs or videos of minors.",
      "Any images collected are stored securely and used solely for the purposes outlined in this Privacy Notice.",
    ],
  },
  {
    id: "legitimate-interests",
    title: "Legitimate Interests",
    body: [
      "Legitimate interest is one of the legal reasons why we may process your personal information. We process your personal information for a number of legitimate interests, including managing all aspects of our relationship with you, for marketing, to help us improve our services and products, and in order to exercise our rights or handle claims.",
      "Taking into account your interests, rights and freedoms, legitimate interests which allow us to process your personal information include:",
    ],
    list: [
      "To manage our relationship with you, our business and third parties who provide products or services for us;",
      "To make sure that complaints or queries are handled efficiently and to enhance our products and services;",
      "To keep our records up to date and to provide you with marketing as allowed by law;",
      "To develop and carry out marketing activities and to show you information that is of interest to you, based on our understanding of your preferences;",
      "To monitor how well we are meeting our performance expectations in the delivery of our services (e.g. call recording);",
      "To pursue our legitimate interest in managing the safety and security of our premises and services for the prevention, detection and prosecution of crime, and security, health and safety (e.g. CCTV video images);",
      "To enforce or apply our website terms of use, our policy terms and conditions or other contracts, or to protect our (or our customers' or other people's) rights, property or safety;",
      "To exercise our rights, to defend ourselves from claims, and to keep to laws and regulations that apply to us and the third parties we work with; and",
      "To take part in, or be the subject of, any sale, purchase, merger or takeover of all or part of our business.",
    ],
  },
  {
    id: "information-sharing",
    title: "Information Sharing",
    body: [
      "We share your information for the purposes set out in this Privacy Notice, with the following categories of recipients:",
    ],
    subsections: [
      {
        heading: "Our service providers",
        body: [
          "We use other companies, agents or contractors to perform services on our behalf, including:",
        ],
        list: [
          "Marketing, advertising and communications agencies;",
          "Credit reference agencies;",
          "External auditors and consultants.",
        ],
        footer:
          "In the course of providing such services, these service providers may have access to your personal information. However, we will only provide our service providers with personal information which is necessary for them to perform their services, and we require them not to use your information for any other purpose. We will use our best efforts to ensure that all our service providers keep your personal information secure.",
      },
      {
        heading: "Third parties permitted by law",
        body: [
          "In certain circumstances, we may be required to disclose or share your personal information in order to comply with a legal or regulatory obligation (for example, we may be required to disclose personal information to the police, regulators, government agencies, courts or any administrative authorities empowered by law to seek that information — e.g. BOT, FIU, TRA, PDPC).",
        ],
      },
      {
        heading: "Banking and payment partners",
        body: [
          "Other financial institutions, card schemes (Visa, Mastercard) and the National Payment Switch.",
        ],
      },
    ],
    footer: [
      "We may also disclose your personal information to third parties where disclosure is both legally permissible and necessary to protect or defend our rights, matters of national security, law enforcement, to enforce our contracts, or to protect your rights or those of the public.",
    ],
  },
  {
    id: "your-rights",
    title: "Your Rights",
    body: [
      "The personal data protection law in the United Republic of Tanzania provides individuals with the following rights:",
    ],
    list: [
      "Right to be informed whether your personal data is being processed by or on behalf of the data controller;",
      "Right to be given by the data controller a description of the personal data of which you are the data subject, the purposes for which it is being processed, and the recipients or classes of recipients to whom it is or may be disclosed;",
      "Right to rectification: the right to have inaccurate information about you rectified;",
      "Right to erasure: the right to have certain personal information about you erased;",
      "Right to restriction of processing: the right to request that your personal information is only used for restricted purposes;",
      "Right to object: the right to object to the use of personal information (including the right to object to marketing);",
      "Right to data portability: the right to ask for personal information you have made available to us to be transferred to you or a third party;",
      "Right to withdraw consent: you have the right to withdraw any consent you have given us to handle your personal information. If you withdraw your consent, this will not affect the lawfulness of use of your personal information prior to the withdrawal of your consent.",
    ],
    footer: [
      "These rights may not apply in all cases. If we are not able to comply with your request, we will explain why. In response to a request, we will ask you to verify your identity if we need to, and to provide information that helps us to understand your request better.",
      "You also have the right to lodge a complaint with the Personal Data Protection Commission (PDPC) if you believe that we have not complied with applicable data protection laws.",
    ],
  },
  {
    id: "how-we-protect",
    title: "How Do We Protect Your Personal Information?",
    body: [
      "We have implemented technical and organisational controls to safeguard the personal information in our custody and control. Such measures include, for example:",
    ],
    list: [
      "Limiting access to personal information only to employees and authorised service providers who need to know such information for the purposes described in this Privacy Notice;",
      "Adopting strong security protocols on networks and systems;",
      "Using email security settings when sending and/or receiving confidential emails;",
      "Applying physical access controls, such as marking confidential documents clearly and prominently, and restricting access to confidential documents on a need-to-know basis;",
      "Using privacy filters;",
      "Disposing of confidential documents that are no longer needed, through shredding or similar means;",
      "Using a mode of delivery or transmission of personal data that affords the appropriate level of security, confirming the intended recipient of personal data, as well as other administrative, technical and physical safeguards.",
    ],
    footer: [
      "While we endeavour to protect our systems, sites, operations and information against unauthorised access, use, modification and disclosure, due to the inherent nature of the Internet as an open global communications vehicle and other risk factors, we cannot guarantee that any information, during transmission or while stored on our systems, will be absolutely safe from intrusion by others, such as hackers.",
    ],
  },
  {
    id: "retention",
    title: "How Long Do We Keep Your Personal Information?",
    body: [
      "We will only retain your personal data for as long as necessary for the purpose for which that data was collected and to the extent permitted by applicable laws.",
    ],
  },
] as const;

function Paragraphs({ items }: { items: readonly string[] }) {
  return (
    <>
      {items.map((p, i) => (
        <p key={i} className="mt-4 text-body leading-relaxed first:mt-0">
          {p}
        </p>
      ))}
    </>
  );
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="mt-4 space-y-2.5">
      {items.map((li, i) => (
        <li key={i} className="flex gap-3 text-body leading-relaxed">
          <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#1A8A3A]" aria-hidden />
          <span>{li}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <main className="bg-gray-bg">
      {/* Hero — matches the site's content-page hero pattern (pattern bg + navy
          overlay + breadcrumb) and clears the fixed navbar with pt-32/36. */}
      <section className="relative overflow-hidden pt-32 pb-16 sm:pt-36 sm:pb-20">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "url('/images/pattern-bg.jpg')", backgroundSize: "1200px", backgroundRepeat: "repeat" }}
        />
        <div className="absolute inset-0 bg-[#1A56A0]/[0.99] pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-white sm:px-8 lg:px-12">
          <nav className="mb-6 flex items-center gap-2 text-sm text-white/70" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <span aria-hidden>/</span>
            <span className="text-white">Privacy Notice</span>
          </nav>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#00C853]">
            <ShieldCheck className="h-4 w-4" />
            Data Protection &amp; Privacy Notice
          </div>
          <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight sm:text-4xl">
            Privacy Notice
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-white/80">
            In this Privacy Notice, &lsquo;we&rsquo;, &lsquo;us&rsquo;, &lsquo;our&rsquo;, &lsquo;ourselves&rsquo; and
            &lsquo;the Bank&rsquo; mean Cooperative Bank Tanzania Limited, a licensed commercial bank incorporated in the
            United Republic of Tanzania and regulated by the Bank of Tanzania. The Bank is committed to protecting your
            privacy and ensuring the confidentiality, integrity and security of your personal data. This Privacy Notice
            explains the types of personal information we collect, how we use it, who we share it with, how we protect it,
            and your rights under the Personal Data Protection Act 2022.
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 sm:py-16 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
          {/* Table of contents */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy/50">On this page</p>
            <nav className="mt-4 space-y-2 border-l border-gray-200">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="-ml-px block border-l-2 border-transparent pl-4 text-sm text-body transition-colors hover:border-[#1A8A3A] hover:text-navy"
                >
                  {s.title}
                </a>
              ))}
              <a
                href="#contact"
                className="-ml-px block border-l-2 border-transparent pl-4 text-sm text-body transition-colors hover:border-[#1A8A3A] hover:text-navy"
              >
                How to Contact Us
              </a>
            </nav>
          </aside>

          {/* Sections */}
          <div className="min-w-0">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="scroll-mt-24 border-t border-gray-200 py-10 first:border-t-0 first:pt-0">
                <h2 className="text-xl font-bold text-navy sm:text-2xl">{s.title}</h2>
                {"body" in s && s.body ? <div className="mt-4"><Paragraphs items={s.body} /></div> : null}
                {"list" in s && s.list ? <Bullets items={s.list} /> : null}

                {"table" in s && s.table ? (
                  <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                      <thead>
                        <tr className="bg-navy text-white">
                          {s.table.head.map((h) => (
                            <th key={h} className="p-4 font-semibold align-top">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {s.table.rows.map((row, ri) => (
                          <tr key={ri} className="border-t border-gray-200 align-top odd:bg-white even:bg-gray-bg">
                            {row.map((cell, ci) => (
                              <td key={ci} className="p-4 text-body leading-relaxed">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}

                {"subsections" in s && s.subsections
                  ? s.subsections.map((sub) => (
                      <div key={sub.heading} className="mt-6">
                        <h3 className="text-base font-semibold text-navy">{sub.heading}</h3>
                        {sub.body ? <div className="mt-2"><Paragraphs items={sub.body} /></div> : null}
                        {"list" in sub && sub.list ? <Bullets items={sub.list} /> : null}
                        {"footer" in sub && sub.footer ? (
                          <p className="mt-4 text-body leading-relaxed">{sub.footer}</p>
                        ) : null}
                      </div>
                    ))
                  : null}

                {"footer" in s && s.footer ? <div className="mt-6"><Paragraphs items={s.footer} /></div> : null}
              </section>
            ))}

            {/* Contact / DPO */}
            <section id="contact" className="scroll-mt-24 border-t border-gray-200 py-10">
              <h2 className="text-xl font-bold text-navy sm:text-2xl">How to Contact Us</h2>
              <p className="mt-4 text-body leading-relaxed">
                If there are any questions or concerns regarding this Privacy Notice, or if you would like to exercise any
                of your rights, please contact our Data Protection Officer:
              </p>
              <a
                href={`mailto:${DPO_EMAIL}`}
                className="mt-5 inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-navy shadow-sm transition-colors hover:border-[#1A8A3A]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1A8A3A]/10">
                  <Mail className="h-5 w-5 text-[#1A8A3A]" />
                </span>
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wider text-navy/50">
                    Data Protection Officer
                  </span>
                  <span className="font-semibold">{DPO_EMAIL}</span>
                </span>
                <ArrowUpRight className="ml-2 h-4 w-4 text-navy/40" />
              </a>
            </section>

            {/* Changes */}
            <section className="border-t border-gray-200 py-10">
              <h2 className="text-xl font-bold text-navy sm:text-2xl">Changes to this Privacy Notice</h2>
              <p className="mt-4 text-body leading-relaxed">
                The Bank may amend this Privacy Notice from time to time to reflect changes in legal, regulatory or
                operational requirements. The latest version will always be available on our website.
              </p>
            </section>

            <div className="mt-6">
              <Link href="/" className="text-sm font-semibold text-[#1A8A3A] hover:underline">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
