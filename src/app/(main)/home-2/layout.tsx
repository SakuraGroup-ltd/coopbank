import NavbarV2 from "@/components/layout/NavbarV2";
import Footer from "@/components/layout/Footer";

export default function Home2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavbarV2 />
      <main>{children}</main>
      <Footer />
    </>
  );
}
