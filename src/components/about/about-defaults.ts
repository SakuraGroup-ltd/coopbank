// Default (fallback) content for the About page sections. These are the
// exact values that were hardcoded in src/app/(main)/about-us/page.tsx before
// the sections became CMS-driven blocks — used when no published `about`
// Pages doc exists, and by scripts/seed-pages.ts to seed the CMS with what
// the live site shows today.

export const defaultAboutHeader = {
  badge: "+ About Us",
  title: "Banking Built on Trust",
  subtitle:
    "For over 25 years, Cooperative Bank Tanzania Plc. has been rooted in the cooperative movement — empowering individuals, businesses, and communities across Tanzania.",
  breadcrumb: "About Us",
};

export const defaultPrayer = {
  heading: "Bank Prayer",
  paragraphs: [
    { text: "Ewe Mwenyezi Mungu Muumba wa Mbingu na Nchi,\nTunakushukuru kwa Kutujalia Kuiona Siku ya Leo." },
    { text: "Tunakuomba Utujalie Amani, Upendo na Ushirikiano\nTunapoanza Siku Yetu ya Leo." },
    { text: "Tunakuomba Uwape Busara na Hekima Viongozi\nWetu, Waweze Kutuongoza Vema na Kutoa Maamuzi\nSahihi Yatakayo Inufaisha Benki, Wafanyakazi na\nJamii kwa Ujumla ili Benki Iendelee Kustawi." },
    { text: "Tunakuomba Utujalie Uwezo wa Kufanya Kazi\nkwa Bidii, Maarifa na kwa Kujituma kwa Kufuata\nTaratibu Zote ili Kuepuka Hasara Zinazoweza\nKujitokeza." },
    { text: "Tunaiombea Amani Nchi Yetu ya Tanzania,\nWateja na Wadau Wote wa Benki ili\nTuendelee Kutoa Huduma kwa Tija na Ufanisi." },
    { text: "Eeh Mwenyezi Mungu Tunaomba Tuianze na\nKumaliza Siku Hii ya Leo Chini ya Uangalizi Wako." },
  ],
  amen: "Amina",
};

export const defaultStory = {
  heading: "Our Story",
  paragraphs: [
    { text: "Cooperative Bank Tanzania Plc was established in the 1990s to serve the financial needs of cooperative societies and their members across Tanzania. Founded on the principles of self-help, mutual responsibility, and community ownership, the Bank remains committed to providing inclusive and accessible financial services." },
    { text: "Over the years, the Bank has continuously modernized its services through digital solutions such as CoopNet Internet Banking, the CoopPesa Mobile App, and CoopWakala agency banking, strengthening its mission of expanding financial inclusion, particularly in rural and underserved communities." },
    { text: "A major milestone in the Bank's growth was achieved in 2024 following the merger of Kilimanjaro Cooperative Bank Limited (KCBL) and Tandahimba Community Bank Limited (TCBL), forming Cooperative Bank Tanzania. This strategic merger strengthened the Bank's capacity to serve cooperative institutions, SMEs, farmers, and retail customers nationwide." },
    { text: "Today, Coop Bank Tanzania continues to embrace innovation and digital transformation while building a strong branch and agency network, with a long-term target of establishing over 30 branches nationwide." },
  ],
};

export const defaultBranchNetwork = {
  heading: "Our Branch Network",
  intro: "Growing our presence across Tanzania — from established branches to exciting new locations on the horizon.",
  branches: [{ name: "Dodoma" }, { name: "Mtwara" }, { name: "Tabora" }, { name: "Moshi" }],
  comingSoonText:
    "We are launching new branches in Kagera, Mbeya, Mwanza, and Dar es Salaam between Q3 2026 and Q2 2027, with more locations planned as part of our continued national growth strategy.",
};

export type Milestone = { year: string; title: string; desc: string; color?: string };

export const defaultJourney: { heading: string; intro: string; milestones: Milestone[] } = {
  heading: "Our Journey",
  intro: "Key milestones in the growth of Cooperative Bank Tanzania.",
  milestones: [
    { year: "1990s", title: "Bank Established", desc: "Cooperative Bank Tanzania established to serve cooperative societies and SACCOs, built on self-help, mutual responsibility, and community ownership.", color: "#1A8A3A" },
    { year: "2023", title: "Banking License", desc: "COOP Bank granted a full commercial banking license by the Bank of Tanzania in 2023, marking a key milestone in establishing a modern, member-centred institution.", color: "#1A56A0" },
    { year: "2024", title: "Strategic Merger", desc: "KCBL and TCBL merged to form Cooperative Bank Tanzania, strengthening capacity to serve SMEs, farmers, and retail customers nationwide.", color: "#1A56A0" },
    { year: "2026+", title: "National Expansion", desc: "New branches launching in Kagera, Mbeya, Mwanza, and Dar es Salaam — part of a long-term target of 30+ branches nationwide.", color: "#1A8A3A" },
  ],
};

export const defaultMissionVision = {
  heading: "Mission & Vision",
  missionTitle: "Our Mission",
  missionText:
    "Provide tailored financial solutions, powered by innovation and technology to deliver financial inclusion, member experience and value creation to stakeholders.",
  visionTitle: "Our Vision",
  visionText:
    "To be a leading high-end technology and member-centred Coop Bank, driving financial inclusion.",
  purposeLabel: "Bank Purpose",
  purposeText:
    "Driving socio-economic transformation of our members through financial inclusion initiatives and AI-powered digital innovations to empower and impact livelihoods of ten million families by 2030.",
};

export const defaultCoreValues = {
  heading: "Core Values",
  values: [
    { icon: "Users", title: "Team Player", description: "Collaborate openly, support others. Listen actively, show respect." },
    { icon: "Zap", title: "Agility", description: "Embrace change, adapt quickly. Stay flexible, drive innovation." },
    { icon: "Shield", title: "Accountability", description: "Own our actions, show integrity. Be transparent, keep learning." },
  ],
};
