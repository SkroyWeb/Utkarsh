import React, { useEffect, useState } from "react";
import { useClerk, useUser } from "@clerk/react";
import { Link } from "wouter";

// Sentences shown one by one, replacing the previous one. Edit freely.
// Keep each one short so it stays on a single line on phones.
const taglines = [
  "Ask anything, learn everything.",
  "Any question, one video lesson.",
  "Meet your personal AI teacher.",
  "Learn at your own pace.",
  "Download lessons, revisit anytime.",
];

function RotatingTagline() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let swap: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      setVisible(false); // fade out current sentence
      swap = setTimeout(() => {
        setIndex((i) => (i + 1) % taglines.length); // switch to next
        setVisible(true); // fade in
      }, 400);
    }, 3500); // time each sentence stays on screen (ms)
    return () => {
      clearInterval(timer);
      clearTimeout(swap);
    };
  }, []);

  return (
    <p
      className={`text-gray-600 mt-2 text-center md:text-left font-medium min-h-[1.75rem] transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {taglines[index]}
    </p>
  );
}

export default function Header() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const displayName =
    user?.firstName || user?.primaryEmailAddress?.emailAddress || "Account";

  return (
    <header className="mb-8">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <img
            src="https://res.cloudinary.com/dl3ga7ifw/image/upload/v1790096724/90a3ae05-88ec-4fd4-9ebc-b89dd5830358_pxp8vf.png"
            alt="Utkarsh AI Teacher"
            className="w-112 h-28 object-contain -mt-4 -mb-4 md:-mt-8 md:-mb-4"
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 md:-mt-2">
          <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 flex items-center text-sm transition-colors">
            <span className="material-icons text-sm mr-1">help_outline</span>
            Help
          </button>
          {user ? (
            <>
              <Link
                href="/user-portal"
                className="bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg text-blue-700 flex items-center text-sm transition-colors"
              >
                <span className="material-icons text-sm mr-1">
                  video_library
                </span>
                My lessons
              </Link>
              <span className="bg-gray-100 px-4 py-2 rounded-lg text-gray-700 text-sm flex items-center max-w-[220px] truncate">
                <span className="material-icons text-sm mr-1">
                  account_circle
                </span>
                {displayName}
              </span>
              <button
                type="button"
                onClick={() => signOut({ redirectUrl: "/" })}
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 flex items-center text-sm transition-colors"
              >
                <span className="material-icons text-sm mr-1">logout</span>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-gray-700 flex items-center text-sm transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-white flex items-center text-sm transition-colors"
              >
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
      <RotatingTagline />
    </header>
  );
}
