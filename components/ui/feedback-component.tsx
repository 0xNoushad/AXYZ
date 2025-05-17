// filePath: components/ui/feedback-component.tsx
"use client";

import { FaRegSmileBeam, FaRegSmile, FaRegSadTear, FaRegSadCry } from "react-icons/fa";
// MessageSquareText was not used, so it's removed.
import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Assuming this path is correct

interface FeedbackComponentProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Feedback component that displays as a popup
 * Allows users to provide feedback with emoji ratings and text,
 * and submits data to a pre-filled Google Form.
 */
export function FeedbackComponent({ isOpen, onClose }: FeedbackComponentProps) {
  const [rating, setRating] = useState<number | null>(null); // Changed initial to null for clarity
  const [feedback, setFeedback] = useState("");
  const node = useRef<HTMLDivElement>(null);

  // --- Google Form Configuration ---
  // IMPORTANT: Replace these with your actual Google Form ID and entry IDs
  const GOOGLE_FORM_ID = "YOUR_GOOGLE_FORM_ID_HERE";
  const RATING_ENTRY_ID = "entry.YOUR_RATING_FIELD_ID_HERE"; // e.g., entry.123456789
  const FEEDBACK_TEXT_ENTRY_ID = "entry.YOUR_FEEDBACK_FIELD_ID_HERE"; // e.g., entry.987654321
  // --- End of Google Form Configuration ---

  const handleSubmit = () => {
    if (!feedback && rating === null) { // Also check for rating if you want to make it mandatory
        console.log("Feedback or rating is empty.");
        // Optionally, show a message to the user
        return;
    }

    // Construct the Google Form URL
    // usp=pp_url is important for pre-filled links to work as expected
    let googleFormUrl = `https://docs.google.com/forms/d/e/${GOOGLE_FORM_ID}/viewform?usp=pp_url`;

    if (rating !== null) {
        googleFormUrl += `&${RATING_ENTRY_ID}=${encodeURIComponent(rating)}`;
    }
    if (feedback) {
        googleFormUrl += `&${FEEDBACK_TEXT_ENTRY_ID}=${encodeURIComponent(feedback)}`;
    }

    // Open the Google Form in a new tab
    window.open(googleFormUrl, "_blank");

    // Reset feedback and rating after submission attempt
    setFeedback("");
    setRating(null);
    onClose(); // Close the popup
  };

  // Handle clicks outside the component to close it
  useEffect(() => {
    if (isOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        if (node.current && !node.current.contains(e.target as Node)) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null; // Don't render anything if not open
  }

  return (
    // The main div for the popup content
    // Positioned absolutely relative to its parent in SessionNavBar
    <div
      ref={node}
      className="absolute bottom-full mb-2 left-0 z-50 flex flex-col gap-4 px-6 py-3 bg-background shadow-lg border border-primary/20 items-start transition-all ease-in-out overflow-hidden rounded-lg w-[19rem] max-[374px]:w-[15rem] h-auto" // Use h-auto for dynamic height, or keep fixed height if preferred
      // Removed inline style for transition, relying on Tailwind classes. Add them if specific non-tailwind transitions are needed.
    >
      <div className="w-full">
        <textarea
          className="w-full h-[7rem] p-2 rounded-md border border-primary/20 resize-none text-primary bg-transparent focus:ring-1 focus:ring-primary/50 outline-none text-sm placeholder-muted-foreground" // Corrected outline-hidden to outline-none and added focus styles
          placeholder="Your feedback..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>
      <div className="flex justify-between w-full items-center max-[374px]:flex-col max-[374px]:gap-3">
        <div className="flex items-center justify-center gap-3 sm:gap-4">
          {[
            { icon: FaRegSadCry, ratingValue: 1, color: "red" },
            { icon: FaRegSadTear, ratingValue: 2, color: "orange" },
            { icon: FaRegSmile, ratingValue: 3, color: "gold" }, // Changed white to gold for better visibility
            { icon: FaRegSmileBeam, ratingValue: 4, color: "lightgreen" },
          ].map((item) => (
            <button
              key={item.ratingValue}
              onClick={() => setRating(item.ratingValue)}
              className="active:scale-[.95] hover:scale-110 transition-all duration-200 text-primary focus:outline-none"
              aria-label={`Rate ${item.ratingValue}`}
            >
              <item.icon
                size={26}
                className={`${rating === item.ratingValue ? "opacity-100" : "opacity-60 hover:opacity-80"}`}
                fill={`${rating === item.ratingValue ? item.color : "currentColor"}`}
              />
            </button>
          ))}
        </div>
        <div>
          <Button
            className="text-sm cursor-pointer px-3 py-1.5 max-[374px]:w-full max-[374px]:py-2 flex items-center justify-center"
            onClick={handleSubmit}
            disabled={!feedback && rating === null} // Disable if no feedback text AND no rating
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}