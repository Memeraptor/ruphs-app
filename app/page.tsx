"use client";

import { useEffect, useState } from "react";
import { genderImages } from "@/services/imageMaps/genderPortraitsMap";
import { specMap } from "@/services/imageMaps/specializationIconMap";

interface Faction {
  id: number;
  name: string;
}

interface Race {
  id: number;
  name: string;
  slug: string;
  faction: Faction;
}

interface Class {
  id: number;
  name: string;
  slug: string;
  colorCode: string;
}

interface Specialization {
  id: number;
  name: string;
  slug: string;
  class: Class;
}

interface Character {
  id: number;
  name: string;
  level: number;
  gender: string;
  note: string;
  race: Race;
  specialization: Specialization;
}

interface GroupedCharacters {
  [factionName: string]: {
    faction: Faction;
    classes: {
      [className: string]: {
        class: Class;
        characters: Character[];
      };
    };
  };
}

export default function HomePage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCharacters();
  }, []);

  const fetchCharacters = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/characters?includeRace=true&includeSpecialization=true"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch characters");
      }

      const data = await response.json();
      setCharacters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const groupCharacters = (characters: Character[]): GroupedCharacters => {
    return characters.reduce((acc, character) => {
      const factionName = character.race.faction.name;
      const className = character.specialization.class.name;

      if (!acc[factionName]) {
        acc[factionName] = {
          faction: character.race.faction,
          classes: {},
        };
      }

      if (!acc[factionName].classes[className]) {
        acc[factionName].classes[className] = {
          class: character.specialization.class,
          characters: [],
        };
      }

      acc[factionName].classes[className].characters.push(character);
      return acc;
    }, {} as GroupedCharacters);
  };

  const getFactionColors = (factionName: string) => {
    if (factionName.toLowerCase().includes("alliance")) {
      return {
        primary: "bg-blue-900",
        secondary: "bg-blue-800",
        tertiary: "bg-blue-700",
        text: "text-blue-100",
        border: "border-blue-600",
      };
    } else if (factionName.toLowerCase().includes("horde")) {
      return {
        primary: "bg-red-900",
        secondary: "bg-red-800",
        tertiary: "bg-red-700",
        text: "text-red-100",
        border: "border-red-600",
      };
    }
    // Default colors if faction doesn't match Alliance or Horde
    return {
      primary: "bg-gray-900",
      secondary: "bg-gray-800",
      tertiary: "bg-gray-700",
      text: "text-gray-100",
      border: "border-gray-600",
    };
  };

  const getPortraitImage = (character: Character) => {
    try {
      return (
        genderImages[character.race.slug]?.[character.gender] ||
        "/placeholder-portrait.png"
      );
    } catch {
      return "/placeholder-portrait.png";
    }
  };

  const getSpecializationImage = (character: Character) => {
    try {
      return specMap[character.specialization.slug] || "/placeholder-spec.png";
    } catch {
      return "/placeholder-spec.png";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <div className="alert alert-error max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Error loading characters: {error}</span>
        </div>
      </div>
    );
  }

  const groupedCharacters = groupCharacters(characters);

  return (
    <div className="min-h-screen bg-base-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-base-content">
            Character Roster
          </h1>
          <button
            onClick={() => (window.location.href = "/newcharacter")}
            className="btn btn-primary btn-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Character
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Alliance Faction */}
          {Object.entries(groupedCharacters)
            .filter(([factionName]) =>
              factionName.toLowerCase().includes("alliance")
            )
            .map(([factionName, factionData]) => {
              const colors = getFactionColors(factionName);

              return (
                <div key={factionName} className="mb-8">
                  {/* Faction Header */}
                  <div
                    className={`${colors.primary} ${colors.text} p-4 rounded-t-lg border-b-2 ${colors.border}`}
                  >
                    <h2 className="text-2xl font-bold">{factionName}</h2>
                  </div>

                  {/* Classes within Faction */}
                  <div className={`${colors.secondary} p-4 rounded-b-lg`}>
                    {Object.entries(factionData.classes).map(
                      ([className, classData]) => (
                        <div key={className} className="mb-6 last:mb-0">
                          {/* Class Header */}
                          <div
                            className={`${colors.tertiary} ${colors.text} p-3 rounded-t-lg mb-3`}
                          >
                            <h3 className="text-xl font-semibold">
                              {className}
                            </h3>
                            <p className="text-sm opacity-80">
                              {classData.characters.length} character
                              {classData.characters.length !== 1 ? "s" : ""}
                            </p>
                          </div>

                          {/* Character Badges */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-3 pb-3">
                            {classData.characters.map((character) => (
                              <div
                                key={character.id}
                                className="bg-base-100 rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow border border-base-300"
                              >
                                <div className="flex items-center space-x-3">
                                  {/* Portrait Image */}
                                  <div className="flex-shrink-0">
                                    <img
                                      src={getPortraitImage(character)}
                                      alt={`${character.race.name} ${character.gender}`}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-base-300"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "/placeholder-portrait.png";
                                      }}
                                    />
                                  </div>

                                  {/* Character Info */}
                                  <div className="flex-grow min-w-0">
                                    <h4 className="font-semibold text-base-content truncate">
                                      {character.name}
                                    </h4>
                                    <p className="text-xs text-base-content/70 truncate">
                                      {character.race.name}{" "}
                                      {character.specialization.name} • Lvl{" "}
                                      {character.level}
                                    </p>
                                  </div>

                                  {/* Specialization Icon */}
                                  <div className="flex-shrink-0">
                                    <img
                                      src={getSpecializationImage(character)}
                                      alt={character.specialization.name}
                                      className="w-8 h-8 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "/placeholder-spec.png";
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Character Note (if exists) */}
                                {character.note && (
                                  <div className="mt-2 pt-2 border-t border-base-300">
                                    <p className="text-xs text-base-content/60 line-clamp-2">
                                      {character.note}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}

          {/* Horde Faction */}
          {Object.entries(groupedCharacters)
            .filter(([factionName]) =>
              factionName.toLowerCase().includes("horde")
            )
            .map(([factionName, factionData]) => {
              const colors = getFactionColors(factionName);

              return (
                <div key={factionName} className="mb-8">
                  {/* Faction Header */}
                  <div
                    className={`${colors.primary} ${colors.text} p-4 rounded-t-lg border-b-2 ${colors.border}`}
                  >
                    <h2 className="text-2xl font-bold">{factionName}</h2>
                  </div>

                  {/* Classes within Faction */}
                  <div className={`${colors.secondary} p-4 rounded-b-lg`}>
                    {Object.entries(factionData.classes).map(
                      ([className, classData]) => (
                        <div key={className} className="mb-6 last:mb-0">
                          {/* Class Header */}
                          <div
                            className={`${colors.tertiary} ${colors.text} p-3 rounded-t-lg mb-3`}
                          >
                            <h3 className="text-xl font-semibold">
                              {className}
                            </h3>
                            <p className="text-sm opacity-80">
                              {classData.characters.length} character
                              {classData.characters.length !== 1 ? "s" : ""}
                            </p>
                          </div>

                          {/* Character Badges */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-3 pb-3">
                            {classData.characters.map((character) => (
                              <div
                                key={character.id}
                                className="bg-base-100 rounded-lg p-3 shadow-md hover:shadow-lg transition-shadow border border-base-300"
                              >
                                <div className="flex items-center space-x-3">
                                  {/* Portrait Image */}
                                  <div className="flex-shrink-0">
                                    <img
                                      src={getPortraitImage(character)}
                                      alt={`${character.race.name} ${character.gender}`}
                                      className="w-12 h-12 rounded-full object-cover border-2 border-base-300"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "/placeholder-portrait.png";
                                      }}
                                    />
                                  </div>

                                  {/* Character Info */}
                                  <div className="flex-grow min-w-0">
                                    <h4 className="font-semibold text-base-content truncate">
                                      {character.name}
                                    </h4>
                                    <p className="text-xs text-base-content/70 truncate">
                                      {character.race.name}{" "}
                                      {character.specialization.name} • Lvl{" "}
                                      {character.level}
                                    </p>
                                  </div>

                                  {/* Specialization Icon */}
                                  <div className="flex-shrink-0">
                                    <img
                                      src={getSpecializationImage(character)}
                                      alt={character.specialization.name}
                                      className="w-8 h-8 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.src =
                                          "/placeholder-spec.png";
                                      }}
                                    />
                                  </div>
                                </div>

                                {/* Character Note (if exists) */}
                                {character.note && (
                                  <div className="mt-2 pt-2 border-t border-base-300">
                                    <p className="text-xs text-base-content/60 line-clamp-2">
                                      {character.note}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              );
            })}
        </div>

        {characters.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-base-content mb-2">
              No Characters Found
            </h2>
            <p className="text-base-content/70">
              Start by creating your first character!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
