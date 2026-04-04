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

      <TenementDetailsPage lottery={lottery} onBack={() => {}} />

      <FeedbackWidget />
    </div>
  );
}
