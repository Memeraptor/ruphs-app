"use client";

import { useEffect, useState } from "react";
import CharacterBadge from "@/app/components/CharacterBadge";
import { classMap } from "@/services/imageMaps/classIconMap";

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
  gender: "male" | "female";
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

  const getClassBackgroundImage = (classSlug: string) => {
    try {
      return classMap[classSlug] || "";
    } catch {
      return "";
    }
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
    return {
      primary: "bg-gray-900",
      secondary: "bg-gray-800",
      tertiary: "bg-gray-700",
      text: "text-gray-100",
      border: "border-gray-600",
    };
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
          {Object.entries(groupedCharacters)
            .filter(([factionName]) =>
              factionName.toLowerCase().includes("alliance")
            )
            .map(([factionName, factionData]) => {
              const colors = getFactionColors(factionName);

              return (
                <div key={factionName} className="mb-8">
                  <div
                    className={`${colors.primary} ${colors.text} p-4 rounded-t-lg border-b-2 ${colors.border}`}
                  >
                    <h2 className="text-2xl font-bold">{factionName}</h2>
                  </div>

                  <div className={`${colors.secondary} p-4 rounded-b-lg`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                      {Object.entries(factionData.classes)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([className, classData]) => (
                          <div
                            key={className}
                            className="bg-base-100 rounded-lg shadow-lg overflow-hidden"
                          >
                            <div
                              className="relative p-3 bg-cover bg-center bg-gray-600"
                              style={{
                                backgroundImage: getClassBackgroundImage(
                                  classData.class.slug
                                )
                                  ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${getClassBackgroundImage(
                                      classData.class.slug
                                    )})`
                                  : "linear-gradient(135deg, #374151, #4b5563)",
                              }}
                            >
                              <h3
                                className="text-lg font-bold drop-shadow-lg mb-2"
                                style={{
                                  color: classData.class.colorCode || "#ffffff",
                                }}
                              >
                                {className}
                              </h3>

                              <div className="space-y-1">
                                {classData.characters
                                  .sort((a, b) => a.name.localeCompare(b.name))
                                  .map((character) => (
                                    <CharacterBadge
                                      key={character.id}
                                      character={character}
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}

          {Object.entries(groupedCharacters)
            .filter(([factionName]) =>
              factionName.toLowerCase().includes("horde")
            )
            .map(([factionName, factionData]) => {
              const colors = getFactionColors(factionName);

              return (
                <div key={factionName} className="mb-8">
                  <div
                    className={`${colors.primary} ${colors.text} p-4 rounded-t-lg border-b-2 ${colors.border}`}
                  >
                    <h2 className="text-2xl font-bold">{factionName}</h2>
                  </div>

                  <div className={`${colors.secondary} p-4 rounded-b-lg`}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
                      {Object.entries(factionData.classes)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([className, classData]) => (
                          <div
                            key={className}
                            className="bg-base-100 rounded-lg shadow-lg overflow-hidden"
                          >
                            <div
                              className="relative p-3 bg-cover bg-center bg-gray-600"
                              style={{
                                backgroundImage: getClassBackgroundImage(
                                  classData.class.slug
                                )
                                  ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${getClassBackgroundImage(
                                      classData.class.slug
                                    )})`
                                  : "linear-gradient(135deg, #374151, #4b5563)",
                              }}
                            >
                              <h3
                                className="text-lg font-bold drop-shadow-lg mb-2"
                                style={{
                                  color: classData.class.colorCode || "#ffffff",
                                }}
                              >
                                {className}
                              </h3>

                              <div className="space-y-1">
                                {classData.characters
                                  .sort((a, b) => a.name.localeCompare(b.name))
                                  .map((character) => (
                                    <CharacterBadge
                                      key={character.id}
                                      character={character}
                                    />
                                  ))}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
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
