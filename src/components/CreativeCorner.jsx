import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBookOpen, FaFeatherAlt, FaTheaterMasks } from 'react-icons/fa';

const creativeActivities = [
    { 
        to: "/creative-corner/story-weaver", 
        title: "Story Weaver", 
        description: "Milkar ek kahani banayein", 
        icon: <FaBookOpen size={64} />, 
        gradient: "linear-gradient(135deg, #ff5858, #fbb034)" // red → orange
    },
    { 
        to: "/creative-corner/poem-weaver", 
        title: "Poem Weaver", 
        description: "Milkar ek kavita banayein", 
        icon: <FaFeatherAlt size={64} />, 
        gradient: "linear-gradient(135deg, #00c6ff, #0072ff)" // blue shades
    },
    { 
        to: "/creative-corner/script-weaver", 
        title: "Script Weaver", 
        description: "Milkar ek natak banayein", 
        icon: <FaTheaterMasks size={64} />, 
        gradient: "linear-gradient(135deg, #7b2ff7, #f107a3)" // purple → pink
    },
];

export default function CreativeCorner() {
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4">
            <h1 className="text-6xl font-extrabold text-center text-purple-600 mb-16">🎨 Kalakriti Kendra</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                {creativeActivities.map((activity, index) => (
                    <Link to={activity.to} key={activity.title}>
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
                            whileHover={{ scale: 1.07, y: -5 }}
                            className="p-10 rounded-3xl h-full flex flex-col items-center justify-center text-white shadow-2xl hover:shadow-xl transition-all duration-300"
                            style={{ background: activity.gradient }}
                        >
                            <div className="mb-6">{activity.icon}</div>
                            <h3 className="text-3xl font-bold mb-3">{activity.title}</h3>
                            <p className="text-white/90 text-center text-lg">{activity.description}</p>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
