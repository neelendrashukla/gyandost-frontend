export const levels = [
    { id: 1, name: "Curious Beginner", icon: "🌱", xp_needed: 0 },
    { id: 2, name: "Knowledge Seeker", icon: "📚", xp_needed: 500 },
    { id: 3, name: "Topic Explorer", icon: "🗺️", xp_needed: 1000 },
    { id: 4, name: "Subject Pro", icon: "💡", xp_needed: 1500 },
    { id: 5, name: "Gyan Master", icon: "🧠", xp_needed: 2000 },
    { id: 6, name: "Learning Legend", icon: "🏆", xp_needed: 2500 },
    { id: 7, name: "Wisdom Warrior", icon: "⚔️", xp_needed: 3000 },
    { id: 8, name: "Scholar Supreme", icon: "👑", xp_needed: 3500 },
    { id: 9, name: "Enlightened Sage", icon: "🦉", xp_needed: 4000 },
    { id: 10, name: "GyanDost Guru", icon: "🌟", xp_needed: 4500 },
    
];

export const getCurrentLevel = (xp) => {
    let currentLevel = levels[0];
    for (let i = levels.length - 1; i >= 0; i--) {
        if (xp >= levels[i].xp_needed) {
            currentLevel = levels[i];
            break;
        }
    }
    return currentLevel;
};