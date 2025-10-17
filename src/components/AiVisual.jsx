import React, { useState, useEffect } from 'react';
import { fetchGeneratedVisual } from "../api.js";
import { motion } from 'framer-motion';
import GyanDostMascot from "./GyanDostMascot.jsx";

export default function AiVisual({ prompt }) {
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const generateImage = async () => {
            if (!prompt) { setLoading(false); return; }
            setLoading(true);
            setError(false);
            try {
                const data = await fetchGeneratedVisual(prompt);
                if (data.image) {
                    setImageUrl(`data:image/png;base64,${data.image}`);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Visual generation failed:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };
        generateImage();
    }, [prompt]);

    if (loading) {
        return (
            <div className="w-full aspect-video flex flex-col items-center justify-center bg-gray-100 rounded-lg p-4 my-4">
                <GyanDostMascot state="thinking" className="w-20 h-20" />
                <p className="text-sm text-gray-500 mt-2 animate-pulse">GyanDost is drawing for you...</p>
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div className="w-full aspect-video flex items-center justify-center bg-red-50 rounded-lg my-4">
                <p className="text-red-600 font-semibold">Sorry, image nahi ban paayi.</p>
            </div>
        );
    }

    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="my-4 border rounded-lg overflow-hidden shadow-md">
            <img src={imageUrl} alt={prompt} className="w-full h-auto" />
        </motion.div>
    );
}