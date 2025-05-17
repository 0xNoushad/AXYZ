"use client";

import { FaRegSmileBeam, FaRegSmile, FaRegSadTear, FaRegSadCry } from "react-icons/fa";
import { MessageSquareText } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Feedback component that displays as a popup within the sidebar
 * Allows users to provide feedback with emoji ratings and text
 */
export function FeedbackComponent() {
  const [rating, setRating] = useState<number | null>(0);
  const [feedbackActive, setFeedbackActive] = useState(false);
  const [feedback, setFeedback] = useState("");
  const node = useRef<HTMLDivElement>(null);

  const handleSubmit = () => {
    // Handle form submission logic here
    console.log("Rating:", rating);
    console.log("Feedback:", feedback);

    // Reset feedback and rating after submission
    setFeedback("");
    setRating(0);
    setFeedbackActive(false);
  };

  useEffect(() => {
    if (feedbackActive === true) {
      const handleClickOutside = (e: MouseEvent) => {
        if (node.current && !node.current.contains(e.target as Node)) {
          setFeedbackActive(false);
          setRating(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [feedbackActive]);

  // Add event listener for the hidden trigger button
  useEffect(() => {
    const triggerButton = document.querySelector('.feedback-trigger');
    if (triggerButton) {
      triggerButton.addEventListener('click', () => setFeedbackActive(true));
    }
    return () => {
      if (triggerButton) {
        triggerButton.removeEventListener('click', () => setFeedbackActive(true));
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Hidden trigger button */}
      <button className="feedback-trigger hidden" type="button" aria-hidden="true" />


      {/* Feedback popup */}
      {feedbackActive && (
        <div
          ref={node}
          className="absolute bottom-full mb-2 left-0 z-50 flex gap-4 px-6 py-3 bg-background shadow-md border border-primary/10 items-start transition-all ease-in-out overflow-hidden flex-col rounded-md w-[19rem] max-[374px]:w-[15rem] max-[374px]:h-[16rem] h-[13rem]"
          style={{
            transition:
              "border-radius 0.2s ease-in-out, width 0.2s ease-in-out 0.2s, height 0.2s ease-in-out 0.2s",
          }}
        >
          <div className="w-full">
            <textarea
              className="w-full h-[8rem] p-2 rounded-md border border-primary/10 resize-none -mb-1 text-primary outline-hidden text-sm"
              placeholder="Your feedback..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </div>
          <div className="flex justify-between w-full max-[374px]:flex-col gap-4">
            <div className="flex items-center mt-1.5 justify-center gap-4">
              <button
                onClick={() => setRating(1)}
                className="active:scale-[.95] hover:scale-105 transition-all duration-400 text-primary"
              >
                <FaRegSadCry
                  size={25}
                  className={`${rating === 1 ? "opacity-100" : "opacity-50"}`}
                  fill={`${rating === 1 ? "red" : "currentColor"}`}
                />
              </button>
              <button
                onClick={() => setRating(2)}
                className="active:scale-[.95] hover:scale-105 transition-all duration-400 text-primary"
              >
                <FaRegSadTear
                  size={25}
                  className={`${rating === 2 ? "opacity-100" : "opacity-50"}`}
                  fill={`${rating === 2 ? "orange" : "currentColor"}`}
                />
              </button>
              <button
                onClick={() => setRating(3)}
                className="active:scale-[.95] hover:scale-105 transition-all duration-400 text-primary"
              >
                <FaRegSmile
                  size={25}
                  className={`${rating === 3 ? "opacity-100" : "opacity-50"}`}
                  fill={`${rating === 3 ? "white" : "currentColor"}`}
                />
              </button>
              <button
                onClick={() => setRating(4)}
                className="active:scale-[.95] hover:scale-105 transition-all duration-400 text-primary"
              >
                <FaRegSmileBeam
                  size={25}
                  className={`${rating === 4 ? "opacity-100" : "opacity-50"}`}
                  fill={`${rating === 4 ? "lightgreen" : "currentColor"}`}
                />
              </button>
            </div>
            <div>
              <Button
                className="text-sm cursor-pointer px-2 py-1 max-[374px]:w-full max-[374px]:py-2 flex items-center justify-center"
                onClick={handleSubmit}
                disabled={!feedback}
              >
                Send
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}