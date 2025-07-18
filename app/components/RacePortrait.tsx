import Race from "@/services/Interfaces/Race";
import React from "react";
import { raceImages } from "@/services/imageMaps";

interface Props {
  race: Race;
}

const RacePortrait = ({ race }: Props) => {
  return (
    <div className="flex-shrink-0">
      {(raceImages as Record<string, string>)[race.slug] ? (
        <img
          src={(raceImages as Record<string, string>)[race.slug]}
          alt={`${race.name} icon`}
          className={`w-15 h-15 object-contain rounded-lg p-0.5 ${
            race.factionId === 1 ? `bg-info` : `bg-error`
          }`}
        />
      ) : (
        <div className="w-16 h-16 bg-base-300 rounded-lg flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-base-content/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
      )}
    </div>
  );
};

export default RacePortrait;
