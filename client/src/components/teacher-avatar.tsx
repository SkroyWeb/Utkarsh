import React from "react";

// Topics shown as quick-start chips. Edit freely.
const quickTopics = ["Quantum Physics", "Human Biology", "Climate Change"];

export default function TeacherAvatar() {
  // Tell the search section to run a search for this topic
  const pickTopic = (topic: string) => {
    window.dispatchEvent(new CustomEvent("topicSelected", { detail: topic }));
  };

  // Fills the existing 16:9 video box, so the section size does not change.
  return (
    <div className="absolute inset-0 bg-white flex items-center justify-center px-3 overflow-hidden">
      <div className="text-center max-w-xl">
        {/* Gradient play badge */}
        <div className="relative w-12 h-12 sm:w-24 sm:h-24 lg:w-28 lg:h-28 mx-auto mb-2 sm:mb-4">
          <div className="absolute inset-0 rounded-full bg-indigo-400/30 blur-xl"></div>
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-sky-300 via-indigo-400 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-200">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ml-0.5"
              aria-hidden="true"
            >
              <path
                d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z"
                fill="white"
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-base sm:text-2xl lg:text-3xl font-extrabold leading-tight text-[#141a3c] mb-1 sm:mb-2">
          What would you like to learn today?
        </h2>

        {/* Subtitle hidden on small phones to keep the box size unchanged */}
        <p className="hidden sm:block text-sm lg:text-base text-gray-600 mb-4">
          Enter any topic and your AI buddy will create a video explanation in
          seconds
        </p>

        {/* Quick-start topics */}
        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-3 mt-2 sm:mt-0">
          {quickTopics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => pickTopic(topic)}
              className="text-xs sm:text-sm lg:text-base text-[#141a3c] bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1 sm:px-4 sm:py-2 rounded-full transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}