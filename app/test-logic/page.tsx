"use client";
import { useEffect, useState } from 'react';

// Mock function for answerRemember
async function mockSaveProgress(id: string) {
    console.log("Saving progress for", id);
    await new Promise(r => setTimeout(r, 500)); // Simulate delay
    return { status: "saved" };
}

export default function TestPage() {
    const [queue, setQueue] = useState(["card1", "card2", "card3"]);
    const [index, setIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);

    const currentId = queue[index];

    const answerRemember = async () => {
        if (!currentId) return;
        console.log("Answering remember...");
        await mockSaveProgress(currentId);
        setRevealed(false);
        setIndex(prev => prev + 1);
        console.log("Advanced to next card");
    };

    const handleRemember = async () => {
        if (!revealed) {
            setRevealed(true);
        } else {
            // User clicked Next/Remember after reveal
            await answerRemember();
        }
    };

    // Direct "Remember" click handling (Auto-advance requested by user)
    const handleDirectRemember = async () => {
        // Should SKIP reveal and go straight to next
        await answerRemember();
    }

    return (
        <div className="p-10">
            <h1>Card: {currentId}</h1>
            <p>Revealed: {revealed.toString()}</p>
            <div className="flex gap-4">
                <button onClick={() => setRevealed(true)} className="p-2 bg-gray-200">Reveal</button>
                <button onClick={handleDirectRemember} className="p-2 bg-green-500 text-white">Remember (Auto-Next)</button>
            </div>
        </div>
    )
}
