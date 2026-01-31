"use client";

import { genderImages } from "@/services/imageMaps/genderPortraitsMap";
import { specMap } from "@/services/imageMaps/specializationIconMap";
import Character from "@/services/Interfaces/Character";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface CharacterBadgeProps {
  character: Character;
}

export default function CharacterBadge({ character }: CharacterBadgeProps) {
  const router = useRouter();

  const raceName = character.race?.name || "Unknown Race";
  const raceSlug = character.race?.slug || "unknown";
  const specializationName =
    character.specialization?.name || "Unknown Specialization";
  const specializationSlug = character.specialization?.slug || "unknown";
  const className = character.specialization?.class?.name || "Unknown Class";

  const getPortraitImage = (char: Character) => {
    try {
      return (
        genderImages[raceSlug]?.[char.gender] || "/placeholder-portrait.png"
      );
    } catch {
      return "/placeholder-portrait.png";
    }
  };

  const getSpecializationImage = () => {
    try {
      return specMap[specializationSlug] || "/placeholder-spec.png";
    } catch {
      return "/placeholder-spec.png";
    }
  };

  const handleClick = () => {
    router.push(`/characters/${character.id}`);
  };

  return (
    <button
      onClick={handleClick}
      className="group w-full text-left"
      aria-label={`View ${character.name}`}
    >
      <div
        className={`
          relative overflow-hidden
          bg-base-100 rounded-lg p-1 shadow-md border border-base-300
          transition-all duration-300 ease-out
          hover:shadow-xl hover:shadow-black/20
          hover:-translate-y-1
          hover:border-primary/60
          active:scale-95 active:translate-y-0
        `}
      >
        {/* Animated bottom border/glow */}
        <div
          className={`
            absolute bottom-0 left-0 h-0.5 w-0
            bg-gradient-to-r from-transparent via-primary to-transparent
            transition-all duration-500 ease-out
            group-hover:w-full
          `}
        />

        <div className="flex items-center space-x-2">
          {/* Portrait Image */}
          <div className="flex-shrink-0">
            <div
              className={`
                rounded-full border border-base-300 overflow-hidden
                transition-all duration-300 ease-out
                group-hover:border-primary/60 group-hover:scale-105
                group-hover:shadow-md group-hover:shadow-primary/20
              `}
            >
              <Image
                width={120}
                height={120}
                src={getPortraitImage(character)}
                alt={`${raceName} ${character.gender}`}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-portrait.png";
                }}
              />
            </div>
          </div>

          {/* Character Info */}
          <div className="flex-grow min-w-0">
            <h4
              className={`
                font-medium text-sm text-base-content truncate
                transition-colors duration-300
                group-hover:text-primary
              `}
            >
              {character.name}
            </h4>
            <p className="text-xs text-base-content/70 truncate transition-colors duration-300 group-hover:text-base-content/90">
              {raceName} {specializationName} ({className})
            </p>
          </div>

          {/* Specialization Icon */}
          <div
            className={`
              flex-shrink-0 transition-all duration-300 ease-out
              group-hover:scale-110
            `}
          >
            <Image
              src={getSpecializationImage()}
              width={120}
              height={120}
              alt={specializationName}
              className="w-6 h-6 object-contain"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-spec.png";
              }}
            />
          </div>
        </div>
      </div>
    </button>
  );
}
