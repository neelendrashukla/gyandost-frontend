import { supabase } from "./lib/supabase.js";
const BASE = import.meta.env.VITE_API_URL || "https://gyandost-backend.onrender.com";

// Helper function to avoid repetition
async function postRequest(endpoint, body) {
    const res = await fetch(`${BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Network error at ${endpoint}`);
    return res.json();
}

// AI endpoints for all features
export const fetchTutorResponse = (history, message, userClass, language) => postRequest('/api/tutor-chat', { history, message, userClass, language });
export const fetchGameData = (topic, gameType, userClass, language) => postRequest('/api/game-data', { topic, gameType, userClass, language });
export const fetchCreativePrompt = (type, topic, userClass, language) => postRequest('/api/creative-prompt', { type, topic, userClass, language });
export const fetchMindMap = (topic, userClass, language) => postRequest('/api/mindmap', { topic, userClass, language });
export const fetchConceptMatchData = (topic, userClass, language) => postRequest('/api/concept-match-game', { topic, userClass, language });
export const fetchGameTopics = (gameType, userClass, language) => postRequest('/api/game-topics', { gameType, userClass, language });
export const fetchExamQuestions = (subject, chapter, questionCount, userClass, language) => postRequest('/api/generate-exam', { subject, chapter, questionCount, userClass, language });
export const fetchCompletionQuiz = (topic, history, userClass, language) => postRequest('/api/completion-quiz', { topic, history, userClass, language });
export const fetchCreativeTopics = (genre, userClass, language) => postRequest('/api/creative-topics', { genre, userClass, language });
export const fetchStartStory = (topic, genre, userClass, language) => postRequest('/api/start-story', { topic, genre, userClass, language });
export const fetchImprovedStorySegment = (storySoFar, userLine, genre, userClass, language) => postRequest('/api/improve-story', { storySoFar, userLine, genre, userClass, language });
export const fetchStartPoem = (topic, genre, userClass, language) => postRequest('/api/start-poem', { topic, genre, userClass, language });
export const fetchImprovedPoemSegment = (poemSoFar, userLine, genre, userClass, language) => postRequest('/api/improve-poem', { poemSoFar, userLine, genre, userClass, language });
export const fetchStartScript = (scene, genre, userClass, language) => postRequest('/api/start-script', { scene, genre, userClass, language });
export const fetchImprovedScriptSegment = (scriptSoFar, userLine, genre, userClass, language) => postRequest('/api/improve-script', { scriptSoFar, userLine, genre, userClass, language });
export const fetchFinishStory = (storySoFar, genre, userClass, language) => postRequest('/api/finish-story', { storySoFar, genre, userClass, language });
export const fetchFinishPoem = (poemSoFar, genre, userClass, language) => postRequest('/api/finish-poem', { poemSoFar, genre, userClass, language });
export const fetchFinishScript = (scriptSoFar, genre, userClass, language) => postRequest('/api/finish-script', { scriptSoFar, genre, userClass, language });
export const fetchGeneratedVisual = (prompt) => postRequest('/api/generate-visual', { prompt });

// Supabase helpers for Students

export async function saveExamResult(userId, subject, chapter, score, totalQuestions) {
    const { data, error } = await supabase
        .from('exam_results')
        .insert({
            user_id: userId,
            subject: subject,
            chapter: chapter,
            score: score,
            total_questions: totalQuestions
        });
    if (error) throw error;
    return data;
}

export async function fetchUserAchievements(userId) {
    const { data: badges, error: badgeError } = await supabase.from("user_achievements").select("*,badge:badges(*)").eq("user_id", userId);
    const { data: allBadges, error: allBadgeError } = await supabase.from("badges").select("*");

    if (badgeError || allBadgeError) throw badgeError || allBadgeError;
    
    return {
        earnedBadges: badges.map(b => b.badge),
        allBadges
    };
}

export async function awardXpAndLogActivity(userId, xpToAdd, activityType) {
    if (!userId) return null;
    try {
        const { data, error } = await supabase.rpc('handle_user_activity', {
            user_id_input: userId,
            xp_to_add: xpToAdd,
            activity_type_input: activityType
        });
        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Error awarding XP:", error);
        return null;
    }
}