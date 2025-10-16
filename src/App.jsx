import React, { useEffect, useState, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Toaster } from 'react-hot-toast';
import { supabase } from "./lib/supabase.js";
import { useProfile } from "./hooks/useProfile.js";
import { LanguageProvider } from "./context/LanguageContext.jsx";
import GlobalHeader from "./components/GlobalHeader.jsx";
import AnimatedPage from "./components/AnimatedPage.jsx";
import Auth from "./components/Auth.jsx";
import { Howler } from 'howler';
import GyanDostMascot from "./components/GyanDostMascot.jsx";

// --- Lazy Loading Components ---
const Dashboard = lazy(() => import('./components/Dashboard.jsx'));
const AiTutor = lazy(() => import('./components/AiTutor.jsx'));
const MindMapExplorer = lazy(() => import('./components/MindMapExplorer.jsx'));
const SanskritiGyan = lazy(() => import('./components/SanskritiGyan.jsx'));
const GameZone = lazy(() => import('./components/GameZone.jsx'));
const GameLobby = lazy(() => import('./components/GameLobby.jsx'));
const CreativeCorner = lazy(() => import('./components/CreativeCorner.jsx'));
const StoryWeaver = lazy(() => import('./components/StoryWeaver.jsx'));
const PoemWeaver = lazy(() => import('./components/PoemWeaver.jsx'));
const ScriptWeaver = lazy(() => import('./components/ScriptWeaver.jsx'));
const TrophyRoom = lazy(() => import('./components/TrophyRoom.jsx'));
const AiKeAjoobe = lazy(() => import('./components/AiKeAjoobe.jsx'));
const ExamMode = lazy(() => import('./components/ExamMode.jsx'));

// --- Loading Screen ---
const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center h-[60vh]">
    <GyanDostMascot state="thinking" />
    <p className="mt-4 text-white animate-pulse">Loading GyanDost...</p>
  </div>
);

export default function AppWrapper() {
  return (
    <BrowserRouter>
      <App />
      <Toaster position="top-center" reverseOrder={false} />
    </BrowserRouter>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const { profile, loading: profileLoading } = useProfile(session?.user);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoadingInitial(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));

    // 🎧 Unlock Howler audio context
    const unlockAudio = () => {
      Howler.ctx.resume().then(() => {
        document.body.removeEventListener('click', unlockAudio);
      });
    };
    document.body.addEventListener('click', unlockAudio);

    return () => {
      subscription?.unsubscribe?.();
      document.body.removeEventListener('click', unlockAudio);
    };
  }, []);

  if (loadingInitial || (session && profileLoading)) {
    return (
      <div className="flex justify-center items-center h-screen bg-cosmic-blue text-white">
        Loading GyanDost...
      </div>
    );
  }

  if (!session || !profile) {
    return <Auth />;
  }

  const isProfileIncomplete = !profile?.full_name || !profile.user_class;
  if (isProfileIncomplete) {
    return <Auth />;
  }

  return (
    <LanguageProvider session={session}>
      <div className="app">
        <MainAppRoutes session={session} profile={profile} />
      </div>
    </LanguageProvider>
  );
}

function MainAppRoutes({ session, profile }) {
  const location = useLocation();

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <GlobalHeader session={session} profile={profile} />

      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Dashboard session={session} profile={profile} />} />
            <Route path="/ai-tutor" element={<AnimatedPage><AiTutor session={session} /></AnimatedPage>} />
            <Route path="/mind-map-explorer" element={<AnimatedPage><MindMapExplorer session={session} /></AnimatedPage>} />
            <Route path="/sanskriti-gyan" element={<AnimatedPage><SanskritiGyan session={session} /></AnimatedPage>} />
            <Route path="/game-zone" element={<AnimatedPage><GameZone /></AnimatedPage>} />
            <Route path="/game-lobby/:gameType" element={<AnimatedPage><GameLobby session={session} /></AnimatedPage>} />
            <Route path="/creative-corner" element={<AnimatedPage><CreativeCorner session={session} /></AnimatedPage>} />
            <Route path="/creative-corner/story-weaver" element={<AnimatedPage><StoryWeaver session={session} /></AnimatedPage>} />
            <Route path="/creative-corner/poem-weaver" element={<AnimatedPage><PoemWeaver session={session} /></AnimatedPage>} />
            <Route path="/creative-corner/script-weaver" element={<AnimatedPage><ScriptWeaver session={session} /></AnimatedPage>} />
            <Route path="/my-trophies" element={<AnimatedPage><TrophyRoom session={session} profile={profile} /></AnimatedPage>} />
            <Route path="/ai-ke-ajoobe" element={<AnimatedPage><AiKeAjoobe session={session} /></AnimatedPage>} />
            <Route path="/exam-mode" element={<AnimatedPage><ExamMode session={session} /></AnimatedPage>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}
