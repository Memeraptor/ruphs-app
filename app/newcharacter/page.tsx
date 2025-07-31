"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import CharacterBadge from "@/app/components/CharacterBadge"; // Adjust path as needed

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
  class?: Class;
  classId: number;
}

interface Character {
  id: number;
  name: string;
  level: number;
  gender: "male" | "female";
  note: string;
  raceId: number;
  specializationId: number;
  race?: Race;
  specialization?: Specialization;
}

interface FormData {
  name: string;
  level: number;
  gender: string;
  factionId: string;
  raceId: string;
  classId: string;
  specializationId: string;
  note: string;
}

interface LoadingState {
  factions: boolean;
  races: boolean;
  classes: boolean;
  specializations: boolean;
  characters: boolean;
  submit: boolean;
}

const CharacterForm = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    level: 1,
    gender: "",
    factionId: "",
    raceId: "",
    classId: "",
    specializationId: "",
    note: "",
  });

  const [factions, setFactions] = useState<Faction[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [allSpecializations, setAllSpecializations] = useState<
    Specialization[]
  >([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);

  const [allCharacters, setAllCharacters] = useState<Character[]>([]);

  const [loading, setLoading] = useState<LoadingState>({
    factions: false,
    races: false,
    classes: false,
    specializations: false,
    characters: false,
    submit: false,
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    loadFactions();
    loadAllSpecializations();
    loadAllCharacters();
  }, []);

  useEffect(() => {
    if (formData.factionId) {
      const factionId = parseInt(formData.factionId);
      loadRaces(factionId);
    } else {
      setRaces([]);
      setFormData((prev) => ({
        ...prev,
        raceId: "",
        classId: "",
        specializationId: "",
      }));
    }
  }, [formData.factionId]);

  useEffect(() => {
    if (formData.raceId) {
      const raceId = parseInt(formData.raceId);
      loadClasses(raceId);
    } else {
      setClasses([]);
      setFormData((prev) => ({ ...prev, classId: "", specializationId: "" }));
    }
  }, [formData.raceId]);

  useEffect(() => {
    if (formData.classId && allSpecializations.length > 0) {
      const filteredSpecs = allSpecializations.filter(
        (spec: Specialization) => spec.classId === parseInt(formData.classId)
      );
      setSpecializations(filteredSpecs);
    } else {
      setSpecializations([]);
      setFormData((prev) => ({ ...prev, specializationId: "" }));
    }
  }, [formData.classId, allSpecializations]);

  const loadFactions = async () => {
    setLoading((prev) => ({ ...prev, factions: true }));
    try {
      const response = await fetch("/api/factions");
      if (!response.ok) throw new Error("Failed to load factions");
      const data: Faction[] = await response.json();
      setFactions(data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load factions";
      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, factions: false }));
    }
  };

  const loadRaces = async (factionId: number) => {
    setLoading((prev) => ({ ...prev, races: true }));
    try {
      const response = await fetch(`/api/races?factionId=${factionId}`);
      if (!response.ok) throw new Error("Failed to load races");
      const data: Race[] = await response.json();
      setRaces(data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load races";
      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, races: false }));
    }
  };

  const loadClasses = async (raceId: number) => {
    setLoading((prev) => ({ ...prev, classes: true }));
    try {
      const classesResponse = await fetch("/api/classes");
      if (!classesResponse.ok) throw new Error("Failed to load classes list");
      const allClasses: Class[] = await classesResponse.json();

      const raceClassResponse = await fetch(
        `/api/race-classes?raceId=${raceId}`
      );
      if (!raceClassResponse.ok)
        throw new Error("Failed to load race-class combinations");
      const raceClassCombinations = await raceClassResponse.json();

      const availableClassIds = raceClassCombinations.map(
        (combination: any) =>
          combination.classId || combination.class_id || combination.id
      );

      const availableClasses = allClasses.filter((cls: Class) =>
        availableClassIds.includes(cls.id)
      );

      setClasses(availableClasses);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? `Failed to load classes: ${error.message}`
          : "Failed to load classes";
      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, classes: false }));
    }
  };

  const loadAllSpecializations = async () => {
    try {
      const response = await fetch("/api/specializations");
      if (!response.ok) throw new Error("Failed to load specializations");
      const data: Specialization[] = await response.json();
      setAllSpecializations(data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load specializations";
      setError(errorMessage);
    }
  };

  const loadAllCharacters = async () => {
    setLoading((prev) => ({ ...prev, characters: true }));
    try {
      const response = await fetch("/api/characters");
      if (!response.ok) throw new Error("Failed to load characters");
      const data: Character[] = await response.json();

      if (data.length > 0) {
        console.log("First character structure:", data[0]);
      }

      setAllCharacters(data);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load characters";
      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, characters: false }));
    }
  };

  const getFilteredCharactersByRace = (): Character[] => {
    if (!formData.raceId || !allCharacters.length) return [];
    const raceId = parseInt(formData.raceId);
    return allCharacters.filter((character) => character.raceId === raceId);
  };

  const getFilteredCharactersByClass = (): Character[] => {
    if (!formData.classId || !allCharacters.length) return [];
    const classId = parseInt(formData.classId);

    return allCharacters.filter((character) => {
      const charSpecialization = allSpecializations.find(
        (spec) => spec.id === character.specializationId
      );
      return charSpecialization?.classId === classId;
    });
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "level" ? parseInt(value) || 1 : value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError("Character name is required");
      return;
    }
    if (!formData.gender) {
      setError("Gender is required");
      return;
    }
    if (!formData.specializationId) {
      setError("Please complete all selections");
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          level: formData.level,
          gender: formData.gender,
          raceId: parseInt(formData.raceId),
          specializationId: parseInt(formData.specializationId),
          note: formData.note.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create character");
      }

      setSuccess("Character created successfully!");

      await loadAllCharacters();

      setTimeout(() => {
        router.push("/");
      }, 1500);

      setFormData({
        name: "",
        level: 1,
        gender: "",
        factionId: "",
        raceId: "",
        classId: "",
        specializationId: "",
        note: "",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create character";
      setError(errorMessage);
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const raceCharacters = getFilteredCharactersByRace();
  const classCharacters = getFilteredCharactersByClass();

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">Create New Character</h2>

              {error && (
                <div className="alert alert-error mb-4">
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
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="alert alert-success mb-4">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{success}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Character Name *</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter character name"
                    className="input input-bordered w-full"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Level</span>
                  </label>
                  <input
                    type="number"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    min="1"
                    max="100"
                    className="input input-bordered w-full"
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Gender *</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Faction *</span>
                  </label>
                  <select
                    name="factionId"
                    value={formData.factionId}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                    disabled={loading.factions}
                    required
                  >
                    <option value="">
                      {loading.factions
                        ? "Loading factions..."
                        : "Select Faction"}
                    </option>
                    {factions.map((faction: Faction) => (
                      <option key={faction.id} value={faction.id}>
                        {faction.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Race *</span>
                  </label>
                  <select
                    name="raceId"
                    value={formData.raceId}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                    disabled={!formData.factionId || loading.races}
                    required
                  >
                    <option value="">
                      {!formData.factionId
                        ? "Select faction first"
                        : loading.races
                        ? "Loading races..."
                        : "Select Race"}
                    </option>
                    {races.map((race: Race) => (
                      <option key={race.id} value={race.id}>
                        {race.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Class *</span>
                  </label>
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                    disabled={!formData.raceId || loading.classes}
                    required
                  >
                    <option value="">
                      {!formData.raceId
                        ? "Select race first"
                        : loading.classes
                        ? "Loading classes..."
                        : "Select Class"}
                    </option>
                    {classes.map((cls: Class) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Specialization *</span>
                  </label>
                  <select
                    name="specializationId"
                    value={formData.specializationId}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                    disabled={!formData.classId || loading.specializations}
                    required
                  >
                    <option value="">
                      {!formData.classId
                        ? "Select class first"
                        : loading.specializations
                        ? "Loading specializations..."
                        : "Select Specialization"}
                    </option>
                    {specializations.map((spec: Specialization) => (
                      <option key={spec.id} value={spec.id}>
                        {spec.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Notes</span>
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Optional character notes..."
                    className="textarea textarea-bordered h-24"
                  />
                </div>

                <div className="form-control mt-6">
                  <button
                    onClick={handleSubmit}
                    className={`btn btn-primary ${
                      loading.submit ? "loading" : ""
                    }`}
                    disabled={loading.submit}
                  >
                    {loading.submit
                      ? "Creating Character..."
                      : "Create Character"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Character Preview Section */}
        <div className="lg:col-span-1">
          <div className="space-y-6">
            {/* Characters by Race */}
            {formData.raceId && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">
                    {
                      races.find((r) => r.id === parseInt(formData.raceId))
                        ?.name
                    }{" "}
                    Characters
                    <span className="badge badge-primary">
                      {raceCharacters.length}
                    </span>
                  </h3>
                  {loading.characters ? (
                    <div className="flex justify-center py-4">
                      <span className="loading loading-spinner loading-md"></span>
                    </div>
                  ) : raceCharacters.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {raceCharacters.map((character) => {
                        const hydratedCharacter: Character = {
                          ...character,
                          race: races.find((r) => r.id === character.raceId),
                          specialization: allSpecializations.find(
                            (s) => s.id === character.specializationId
                          ),
                        };

                        if (
                          hydratedCharacter.specialization &&
                          hydratedCharacter.specialization.classId
                        ) {
                          hydratedCharacter.specialization.class = classes.find(
                            (c) =>
                              c.id === hydratedCharacter.specialization?.classId
                          );
                        }

                        // IMPORTANT: Only render if we have all the data CharacterBadge needs
                        if (
                          !hydratedCharacter.race ||
                          !hydratedCharacter.specialization ||
                          !hydratedCharacter.specialization.class
                        ) {
                          console.warn(
                            "Skipping CharacterBadge due to incomplete data:",
                            hydratedCharacter
                          );
                          return null; // Don't render if data is not complete
                        }

                        return (
                          <CharacterBadge
                            key={character.id}
                            character={hydratedCharacter as Required<Character>}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-base-content/70 text-sm">
                      No characters of this race yet.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Characters by Class */}
            {formData.classId && (
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">
                    {
                      classes.find((c) => c.id === parseInt(formData.classId))
                        ?.name
                    }{" "}
                    Characters
                    <span className="badge badge-secondary">
                      {classCharacters.length}
                    </span>
                  </h3>
                  {loading.characters ? (
                    <div className="flex justify-center py-4">
                      <span className="loading loading-spinner loading-md"></span>
                    </div>
                  ) : classCharacters.length > 0 ? (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {classCharacters.map((character) => {
                        const hydratedCharacter: Character = {
                          ...character,
                          race: races.find((r) => r.id === character.raceId),
                          specialization: allSpecializations.find(
                            (s) => s.id === character.specializationId
                          ),
                        };

                        if (
                          hydratedCharacter.specialization &&
                          hydratedCharacter.specialization.classId
                        ) {
                          hydratedCharacter.specialization.class = classes.find(
                            (c) =>
                              c.id === hydratedCharacter.specialization?.classId
                          );
                        }

                        // IMPORTANT: Only render if we have all the data CharacterBadge needs
                        if (
                          !hydratedCharacter.race ||
                          !hydratedCharacter.specialization ||
                          !hydratedCharacter.specialization.class
                        ) {
                          console.warn(
                            "Skipping CharacterBadge due to incomplete data:",
                            hydratedCharacter
                          );
                          return null; // Don't render if data is not complete
                        }

                        return (
                          <CharacterBadge
                            key={character.id}
                            character={hydratedCharacter as Required<Character>}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-base-content/70 text-sm">
                      No characters of this class yet.
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Instructions */}
            {!formData.raceId && !formData.classId && (
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h3 className="card-title text-lg">Character Preview</h3>
                  <p className="text-base-content/70 text-sm">
                    Select a race and class to see existing characters that
                    match your selections.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterForm;
