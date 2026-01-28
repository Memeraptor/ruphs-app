"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Race from "@/services/Interfaces/Race";
import RacePortrait from "@/app/components/RacePortrait";
import { factionImages } from "@/services/imageMaps/factionMap";

interface Faction {
  id: number;
  name: string;
}

interface RaceClass {
  id: number;
  class: {
    id: number;
    name: string;
    slug: string;
    armorType: string;
    colorCode: string;
  };
}

interface RaceWithRelations extends Race {
  faction?: Faction;
  classes?: RaceClass[];
}

export default function EditRacePage() {
  const params = useParams();
  const router = useRouter();
  const raceId = params.id as string;

  const [race, setRace] = useState<RaceWithRelations | null>(null);
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form fields
  const [name, setName] = useState("");
  const [factionId, setFactionId] = useState<number>(0);

  // Validation errors
  const [nameError, setNameError] = useState<string | null>(null);

  // Fetch race data
  useEffect(() => {
    const fetchRace = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/races/${raceId}?includeFaction=true&includeClasses=true`,
        );

        if (!response.ok) {
          let errorMessage = "Failed to fetch race";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        if (!data.data) {
          throw new Error("Invalid response format from server");
        }

        setRace(data.data);
        setName(data.data.name);
        setFactionId(data.data.factionId);
      } catch (err) {
        console.error("Error fetching race:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRace();
  }, [raceId]);

  // Fetch factions
  useEffect(() => {
    const fetchFactions = async () => {
      try {
        const response = await fetch("/api/factions");
        if (!response.ok) {
          console.error(`Failed to fetch factions: HTTP ${response.status}`);
          return;
        }
        const data = await response.json();
        setFactions(data);
      } catch (err) {
        console.error("Error fetching factions:", err);
      }
    };

    fetchFactions();
  }, []);

  // Validate name
  const validateName = (value: string): boolean => {
    if (!value.trim()) {
      setNameError("Race name is required");
      return false;
    }
    if (value.length > 255) {
      setNameError("Race name must be less than 255 characters");
      return false;
    }
    setNameError(null);
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage(null);
    setError(null);

    // Validate all fields
    const isNameValid = validateName(name);

    if (!isNameValid) {
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/races/${raceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          factionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update race");
      }

      setSuccessMessage("Race updated successfully!");
      setRace(data.data);

      // Scroll to top to show success message
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    router.push("/races");
  };

  // Get faction background image
  const getFactionImage = (factionName: string): string | null => {
    return factionImages[factionName] || null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading race data...</div>
      </div>
    );
  }

  if (error && !race) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <h2 className="text-red-400 text-xl font-bold mb-2">Error</h2>
          <p className="text-red-300">{error}</p>
          <button
            onClick={handleCancel}
            className="mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
          >
            Back to Races
          </button>
        </div>
      </div>
    );
  }

  if (!race) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="text-blue-400 hover:text-blue-300 mb-4 flex items-center gap-2 transition-colors"
          >
            <span>←</span> Back to Races
          </button>
          <h1 className="text-4xl font-bold text-white">Edit Race</h1>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-900/20 border border-green-500 rounded-lg p-4">
            <p className="text-green-400">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {/* Left Column - Portrait with Faction Background */}
          <div className="lg:col-span-1 flex flex-col">
            {(() => {
              const factionImage = race.faction?.name
                ? getFactionImage(race.faction.name)
                : null;
              const gradientColor =
                race.factionId === 1
                  ? "bg-gradient-to-b from-blue-900/40 via-blue-700/30 to-blue-900/40"
                  : "bg-gradient-to-b from-red-900/40 via-red-700/30 to-red-900/40";

              return (
                <div className="bg-gray-800 rounded-lg p-6 sticky top-8 relative overflow-hidden w-full flex-1 flex items-center">
                  {/* Faction Background Image */}
                  {factionImage && (
                    <div
                      className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
                      style={{ backgroundImage: `url(${factionImage})` }}
                    />
                  )}

                  {/* Dynamic gradient color film effect */}
                  <div
                    className={`absolute inset-0 ${gradientColor} rounded-lg`}
                  ></div>

                  <div className="relative z-10 flex flex-col items-center w-full">
                    <p className="text-2xl font-bold text-white mb-6">
                      {race.name}
                    </p>
                    <div className="w-full flex justify-center mb-6">
                      <RacePortrait race={race} />
                    </div>
                    <div className="text-center">
                      <p className="text-gray-300 text-xs mb-1">Faction</p>
                      <p className="text-white font-semibold text-base">
                        {race.faction?.name || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-2 flex flex-col">
            <form
              onSubmit={handleSubmit}
              className="bg-gray-800 rounded-lg p-6 flex-1 flex flex-col"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Edit Race Information
              </h2>

              {/* Name Field */}
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Race Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    validateName(e.target.value);
                  }}
                  className={`w-full px-4 py-2 bg-gray-700 text-white rounded-lg border ${
                    nameError
                      ? "border-red-500 focus:border-red-400"
                      : "border-gray-600 focus:border-blue-500"
                  } focus:outline-none focus:ring-2 ${
                    nameError
                      ? "focus:ring-red-500/20"
                      : "focus:ring-blue-500/20"
                  } transition-colors`}
                  placeholder="Enter race name"
                />
                {nameError && (
                  <p className="mt-1 text-sm text-red-400">{nameError}</p>
                )}
              </div>

              {/* Faction Dropdown */}
              <div className="mb-6">
                <label
                  htmlFor="faction"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Faction <span className="text-red-400">*</span>
                </label>
                <select
                  id="faction"
                  value={factionId}
                  onChange={(e) => setFactionId(Number(e.target.value))}
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-colors"
                >
                  {factions.map((faction) => (
                    <option key={faction.id} value={faction.id}>
                      {faction.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Available Classes Display */}
              {race.classes && race.classes.length > 0 && (
                <div className="mb-6 flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Available Classes
                  </label>
                  <div className="bg-gray-700 rounded-lg p-4">
                    <div className="flex flex-wrap gap-2">
                      {race.classes.map((raceClass) => (
                        <span
                          key={raceClass.id}
                          className="px-3 py-1 rounded-full text-sm font-medium text-white"
                          style={{
                            backgroundColor:
                              raceClass.class.colorCode || "#6B7280",
                          }}
                        >
                          {raceClass.class.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">
                    These classes are available for this race
                  </p>
                </div>
              )}

              {/* Form Actions */}
              <div className="flex gap-4 pt-4 border-t border-gray-700">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
