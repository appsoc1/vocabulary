"use client";

import { Suspense, useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useReview } from "@/hooks/useReview";
import { maskWord } from "@/lib/srs/masking";
import type { Card } from "@/types";
import type { CardWithProgress } from "@/lib/db/cards";
import { Check, X, Send, Youtube, ExternalLink, ArrowRight } from "lucide-react";

export default function ReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewContent />
    </Suspense>
  );
}

function ReviewContent() {
  const sp = useSearchParams();
  const folderStr = sp.get("folders") ?? "";
  const folderIds = folderStr;

  const [cards, setCards] = useState<CardWithProgress[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);

  useEffect(() => {
    (async () => {
      if (!folderIds) return;
      setLoadingCards(true);
      try {
        const res = await fetch(`/api/review/session?folderIds=${folderIds}`);
        const data = await res.json();
        if (data.cards) {
          setCards(data.cards);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingCards(false);
      }
    })();
  }, [folderIds]);

  const { loading, currentCard, answerForget, answerRemember } = useReview(cards);

  const renderCount = useRef(0);
  renderCount.current++;

  const [userInput, setUserInput] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [checkResult, setCheckResult] = useState<"correct" | "wrong" | null>(null);

  // FOCUS STATE: Used to hide buttons on mobile when typing to save space
  const [isFocused, setIsFocused] = useState(false);

  const maskedWord = useMemo(() => {
    return currentCard ? maskWord(currentCard.english) : "";
  }, [currentCard?.english]);

  useEffect(() => {
    setUserInput("");
    setRevealed(false);
    setCheckResult(null);
  }, [currentCard?.id]);

  const handleCheck = () => {
    if (!currentCard || !userInput.trim()) return;
    const correct = userInput.trim().toLowerCase() === currentCard.english.toLowerCase();
    setCheckResult(correct ? "correct" : "wrong");
    setRevealed(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !revealed) {
      e.preventDefault();
      handleCheck();
    }
  };

  const handleForget = async () => {
    if (!revealed) {
      setRevealed(true);
      setCheckResult("wrong");
    } else {
      await answerForget();
    }
  };

  const handleRemember = async () => {
    await answerRemember();
  };

  if (loadingCards || loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold">No vocabulary</h3>
      </div>
    );
  }

  if (!currentCard) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-6 text-center">
        <div className="size-20 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <Check size={40} />
        </div>
        <h2 className="text-3xl font-bold">Complete!</h2>
        <a href="/" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg">
          Home
        </a>
      </div>
    );
  }

  // FIXED SHELL LAYOUT V7 - COMPACT FOCUS MODE
  return (
    <div className="fixed inset-0 w-full h-full bg-background overflow-hidden overscroll-none">
      {/* 
        1. Scrollable Content Container
      */}
      <div className="w-full h-full overflow-y-auto px-4 pt-4 pb-[140px] flex flex-col items-center">
        <div className="max-w-2xl w-full space-y-6 flex flex-col items-center">

          {/* Progress Indicator */}
          <div className="w-full text-xs text-muted-foreground text-center mb-1 opacity-50">
            {currentCard.id.slice(0, 4)}...
          </div>

          {/* Card display */}
          <div className="w-full bg-card border rounded-2xl p-6 text-center shadow-sm min-h-[200px] flex flex-col items-center justify-center relative z-10">
            {!revealed ? (
              <div className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-wide text-foreground break-all leading-tight">
                {maskedWord}
              </div>
            ) : (
              <div className="space-y-4 animate-in fade-in duration-200 w-full overflow-hidden">
                <div className={`text-4xl md:text-6xl font-bold break-words leading-tight ${checkResult === "correct" ? "text-green-600" : "text-primary"}`}>
                  {currentCard.english}
                </div>
                <div className="w-20 h-1 bg-muted mx-auto rounded" />
                <div className="text-xl md:text-2xl font-medium text-foreground break-words">
                  {currentCard.meaning_1}
                </div>
                {currentCard.meaning_2 && (
                  <div className="text-base text-muted-foreground break-words">{currentCard.meaning_2}</div>
                )}
                {currentCard.video_url && (
                  <a href={currentCard.video_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm text-blue-500 hover:underline">
                    <Youtube size={16} />
                    <span>Watch</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Buttons Area - HIDDEN ON MOBILE KEYBOARD */}
          {/* We hide this block when 'isFocused' is true to save screen space */}
          <div className={`w-full max-w-2xl z-10 transition-all duration-300 ${isFocused ? 'hidden md:block opacity-0 md:opacity-100 h-0 md:h-auto' : 'opacity-100 h-auto'}`}>
            {!revealed ? (
              <div className="flex gap-3">
                <button
                  onClick={handleForget}
                  className="flex-1 h-12 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                  type="button"
                  onMouseDown={(e) => e.preventDefault()} // Prevent stealing focus
                >
                  <X size={18} />
                  Forget
                </button>
                <button
                  onClick={handleRemember}
                  className="flex-1 h-12 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Check size={18} />
                  Remember
                </button>
              </div>
            ) : (
              <button
                onClick={checkResult === "correct" ? handleRemember : handleForget}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
              >
                Next
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 
        2. Fixed Input Area 
      */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t px-4 py-3 pb-[max(12px,env(safe-area-inset-bottom))] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-end bg-muted/50 rounded-2xl border shadow-sm">
            <textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 100)} // Small delay to allow button clicks if needed
              disabled={revealed}
              rows={1}
              autoFocus
              className="flex-1 min-h-[50px] max-h-[120px] bg-transparent px-4 py-3 text-lg outline-none resize-none disabled:opacity-50"
              style={{ height: 'auto' }}
            />
            <button
              onClick={handleCheck}
              disabled={!userInput.trim() || revealed}
              type="button"
              className="h-10 w-10 mr-2 mb-1.5 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              onMouseDown={(e) => e.preventDefault()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
