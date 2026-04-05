import { SurveyProvider } from "@/context/SurveyContext";
import SurveyContainer from "@/components/survey/SurveyContainer";

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden bg-background text-white flex flex-col font-sans">
      <SurveyProvider>
        <SurveyContainer />
      </SurveyProvider>
    </main>
  );
}
