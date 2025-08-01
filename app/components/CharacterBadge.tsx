import { genderImages } from "@/services/imageMaps/genderPortraitsMap";
import { specMap } from "@/services/imageMaps/specializationIconMap";
import Character from "@/services/Interfaces/Character";

// Make 'race' and 'specialization' optional, and match the 'id' fields from the API

interface CharacterBadgeProps {
  character: Character;
}

export default function CharacterBadge({ character }: CharacterBadgeProps) {
  // Use optional chaining for safe access
  const raceName = character.race?.name || "Unknown Race";
  const raceSlug = character.race?.slug || "unknown"; // Fallback for slug for image map
  const specializationName =
    character.specialization?.name || "Unknown Specialization";
  const specializationSlug = character.specialization?.slug || "unknown"; // Fallback for slug for image map
  // Access class name defensively through specialization
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

  const getSpecializationImage = (char: Character) => {
    try {
      return specMap[specializationSlug] || "/placeholder-spec.png";
    } catch {
      return "/placeholder-spec.png";
    }
  };

  return (
    <div className="bg-base-100 rounded-lg p-1 shadow-md hover:shadow-lg transition-shadow border border-base-300">
      <div className="flex items-center space-x-2">
        {/* Portrait Image */}
        <div className="flex-shrink-0">
          <img
            src={getPortraitImage(character)}
            alt={`${raceName} ${character.gender}`}
            className="w-8 h-8 rounded-full object-cover border border-base-300"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-portrait.png";
            }}
          />
        </div>

        {/* Character Info */}
        <div className="flex-grow min-w-0">
          <h4 className="font-medium text-sm text-base-content truncate">
            {character.name}
          </h4>
          <p className="text-xs text-base-content/70 truncate">
            {raceName} {specializationName} ({className})
          </p>
        </div>

        {/* Specialization Icon */}
        <div className="flex-shrink-0">
          <img
            src={getSpecializationImage(character)}
            alt={specializationName}
            className="w-6 h-6 object-contain"
            onError={(e) => {
              e.currentTarget.src = "/placeholder-spec.png";
            }}
          />
        </div>
      </div>
    </div>
  );
}
