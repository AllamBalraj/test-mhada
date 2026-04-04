import TenementDetailsPage from "./pages/TenementDetailsPage";
import Seo from "./components/seo/Seo";
import FeedbackWidget from "./components/feedback/FeedbackWidget";

export default function App() {
  // Minimal placeholder to satisfy TenementDetailsPage's required prop type.
  // Adjust/extend fields if your Lottery type changes.
  const lottery = {} as any;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Seo
        title="MHADA Lottery Mumbai (2026) | Check Schemes, Cost, EMD"
        description="MHADA Lottery Mumbai 2026: browse MHADA housing schemes with cost, EMD, carpet area, eligibility, and key dates."
        canonicalPath="/"
        keywords={["Mhada lottery", "Mumbai Mhada Lottery", "Mhada Mumbai 2026", "MHADA lottery Mumbai"]}
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: "MHADA Lottery Mumbai",
            url: "https://www.housingmhada.in/",
          },
        ]}
      />
      <header className="sr-only">
        <h1>MHADA Lottery Mumbai 2026</h1>
        <p>Schemes, eligibility, carpet area, cost, EMD, and key dates.</p>
      </header>

      <main className="mx-auto w-full">
        <section aria-label="MHADA lottery overview" className="sr-only">
          <h2>Latest MHADA housing schemes in Mumbai</h2>
        </section>

        <section aria-label="Eligibility and documents" className="sr-only">
          <h2>Eligibility, income groups & required documents</h2>
        </section>

        <section aria-label="Cost and EMD" className="sr-only">
          <h2>Flat cost, EMD and important dates</h2>
        </section>

        <TenementDetailsPage lottery={lottery} onBack={() => {}} />

        <FeedbackWidget />
      </main>
    </div>
  );
}
