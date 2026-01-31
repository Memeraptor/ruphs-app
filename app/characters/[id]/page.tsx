"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { genderImages } from "@/services/imageMaps/genderPortraitsMap";
import { specMap } from "@/services/imageMaps/specializationIconMap";
import Character from "@/services/Interfaces/Character";
import Faction from "@/services/Interfaces/Faction";
import Race from "@/services/Interfaces/Race";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Specialization {
  id: number;
  name: string;
  slug: string;
  classId: number;
  class?: { id: number; name: string; slug?: string };
}

interface RaceClass {
  id: number;
  raceId: number;
  classId: number;
  race: Race;
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------
export default function CharacterPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  // Original data
  const [originalCharacter, setOriginalCharacter] = useState<Character | null>(
    null,
  );

  // Editable state
  const [character, setCharacter] = useState<Character | null>(null);
  const [selectedFactionId, setSelectedFactionId] = useState<number | null>(
    null,
  );

  // Dropdown options
  const [factions, setFactions] = useState<Faction[]>([]);
  const [allCompatibleRaces, setAllCompatibleRaces] = useState<Race[]>([]);
  const [allSpecializations, setAllSpecializations] = useState<
    Specialization[]
  >([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [factionChanged, setFactionChanged] = useState(false);

  // ---------------------------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------------------------
  const characterClassId = character?.specialization?.classId;
  const characterClassName =
    character?.specialization?.class?.name || "Unknown Class";

  // Filter races by selected faction AND class compatibility
  const availableRaces = allCompatibleRaces.filter(
    (race) => race.factionId === selectedFactionId,
  );

  // Filter specializations by character's class
  const availableSpecializations = allSpecializations.filter(
    (spec) => spec.classId === characterClassId,
  );

  // Check if there are unsaved changes
  useEffect(() => {
    if (!originalCharacter || !character) {
      setHasUnsavedChanges(false);
      return;
    }

    const changed =
      character.level !== originalCharacter.level ||
      character.gender !== originalCharacter.gender ||
      character.note !== originalCharacter.note ||
      character.raceId !== originalCharacter.raceId ||
      character.specializationId !== originalCharacter.specializationId;

    setHasUnsavedChanges(changed);
  }, [character, originalCharacter]);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const charRes = await fetch(`/api/characters/${id}`);

      if (!charRes.ok) {
        if (charRes.status === 404) {
          setError("Character not found");
          return;
        }
        throw new Error("Failed to fetch character");
      }

      const charData: Character = await charRes.json();

      // Fetch factions, race-classes (for this character's class), and specializations
      const [factionsRes, raceClassesRes, specsRes] = await Promise.all([
        fetch("/api/factions"),
        fetch(
          `/api/race-classes?classId=${charData.specialization?.classId}&includeRace=true`,
        ),
        fetch("/api/specializations"),
      ]);

      const factionsData: Faction[] = factionsRes.ok
        ? await factionsRes.json()
        : [];
      const raceClassesData: RaceClass[] = raceClassesRes.ok
        ? await raceClassesRes.json()
        : [];
      const specsData: Specialization[] = specsRes.ok
        ? await specsRes.json()
        : [];

      // Extract races from race-classes relationships
      const compatibleRaces = raceClassesData.map((rc) => rc.race);

      setOriginalCharacter(charData);
      setCharacter(charData);
      setSelectedFactionId(charData.race?.factionId || null);
      setFactions(factionsData);
      setAllCompatibleRaces(compatibleRaces);
      setAllSpecializations(specsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------
  const handleFactionChange = (factionId: number) => {
    setSelectedFactionId(factionId);
    setFactionChanged(true);
    // Clear race selection when faction changes
    if (character) {
      setCharacter({
        ...character,
        raceId: 0, // Invalid ID to force user to pick
        race: undefined,
      });
    }
  };

  const handleSaveChanges = async () => {
    if (!character || !originalCharacter) return;

    // Validation: Can't save if faction changed but race not selected
    if (factionChanged && (!character.raceId || character.raceId === 0)) {
      setError("Please select a race for the new faction");
      setSaveStatus("error");
      setTimeout(() => {
        setError(null);
        setSaveStatus("idle");
      }, 3000);
      return;
    }

    setSaving(true);
    setSaveStatus("idle");
    setError(null);

    try {
      const patch: Partial<Character> = {};

      if (character.level !== originalCharacter.level)
        patch.level = character.level;
      if (character.gender !== originalCharacter.gender)
        patch.gender = character.gender;
      if (character.note !== originalCharacter.note)
        patch.note = character.note;
      if (character.raceId !== originalCharacter.raceId)
        patch.raceId = character.raceId;
      if (character.specializationId !== originalCharacter.specializationId)
        patch.specializationId = character.specializationId;

      const res = await fetch(`/api/characters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.message || "Update failed");
      }

      const { data: updated } = await res.json();
      setOriginalCharacter(updated);
      setCharacter(updated);
      setSelectedFactionId(updated.race?.factionId || null);
      setFactionChanged(false);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
      setSaveStatus("error");
      setTimeout(() => {
        setError(null);
        setSaveStatus("idle");
      }, 3000);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!character) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete "${character.name}"?\n\nThis action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`/api/characters/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/characters");
      } else {
        const errBody = await res.json().catch(() => ({}));
        setError(errBody.message || "Failed to delete character");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete character",
      );
    }
  };

  // ---------------------------------------------------------------------------
  // Display helpers
  // ---------------------------------------------------------------------------
  const raceName = character?.race?.name || "Unknown Race";
  const raceSlug = character?.race?.slug || "unknown";
  const specializationName =
    character?.specialization?.name || "Unknown Specialization";
  const specializationSlug = character?.specialization?.slug || "unknown";

  const portraitSrc =
    (character && (genderImages[raceSlug]?.[character.gender] || null)) ||
    "/placeholder-portrait.png";
  const specIconSrc = specMap[specializationSlug] || "/placeholder-spec.png";

  // ---------------------------------------------------------------------------
  // Loading skeleton
  // ---------------------------------------------------------------------------
  if (loading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-base-100 rounded-2xl shadow-lg p-6 border border-base-300 animate-pulse">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-24 h-24 rounded-full bg-base-300 flex-shrink-0" />
              <div className="flex-grow space-y-3">
                <div className="h-6 w-48 bg-base-300 rounded" />
                <div className="h-4 w-64 bg-base-300 rounded" />
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-12 bg-base-300 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error / not found
  // ---------------------------------------------------------------------------
  if (error && !character) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="bg-base-100 rounded-2xl shadow-lg p-8 border border-base-300 text-center max-w-md w-full">
          <div className="text-error text-5xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-base-content mb-2">
            {error}
          </h2>
          <button
            onClick={() => router.push("/characters")}
            className="btn btn-primary btn-sm mt-4"
          >
            Back to Characters
          </button>
        </div>
      </div>
    );
  }

  if (!character) return null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-base-200 p-4 flex justify-center">
      <div className="w-full max-w-2xl">
        {/* Back link */}
        <button
          onClick={() => router.push("/")}
          className="text-sm text-base-content/60 hover:text-primary transition-colors mb-4 flex items-center gap-1"
        >
          ← Back to Home
        </button>

        <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300 overflow-hidden">
          {/* ---- Header / hero ---- */}
          <div className="relative bg-gradient-to-br from-base-200 to-base-300 px-6 pt-6 pb-8">
            <div className="flex items-end gap-5">
              {/* Portrait */}
              <div className="relative flex-shrink-0">
                <div
                  className={`w-24 h-24 rounded-full border-4 shadow-md overflow-hidden bg-base-300 ${
                    character.race?.factionId === 1
                      ? "border-blue-700"
                      : "border-red-700"
                  }`}
                >
                  <Image
                    src={portraitSrc}
                    alt={`${raceName} ${character.gender}`}
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-portrait.png";
                    }}
                  />
                </div>
                {/* Spec icon badge */}
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-base-100 border-2 border-base-300 flex items-center justify-center shadow-sm">
                  <Image
                    src={specIconSrc}
                    alt={specializationName}
                    width={18}
                    height={18}
                    className="object-contain"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder-spec.png";
                    }}
                  />
                </div>
              </div>

              {/* Name + subtitle */}
              <div className="pb-1">
                <h1 className="text-2xl font-bold text-base-content leading-tight">
                  {character.name}
                </h1>
                <p className="text-sm text-base-content/60 mt-0.5">
                  {raceName} · {specializationName} · {characterClassName}
                </p>
              </div>
            </div>

            {/* Status badges (top-right) */}
            <div className="absolute top-4 right-5 flex gap-2">
              {hasUnsavedChanges && saveStatus === "idle" && (
                <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-warning/15 text-warning">
                  Unsaved changes
                </div>
              )}
              {saveStatus === "saved" && (
                <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-success/15 text-success">
                  ✓ Saved
                </div>
              )}
              {saveStatus === "error" && (
                <div className="text-xs font-medium px-2.5 py-1 rounded-full bg-error/15 text-error">
                  ✕ Failed
                </div>
              )}
            </div>
          </div>

          {/* ---- Error banner ---- */}
          {error && (
            <div className="px-6 py-3 bg-error/10 border-b border-error/20">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* ---- Editable fields ---- */}
          <div className="px-6 py-5 space-y-4">
            {/* Name */}
            <FieldRow label="Name">
              <input
                type="text"
                value={character.name}
                disabled={saving}
                onChange={(e) =>
                  setCharacter({ ...character, name: e.target.value })
                }
                className="input input-bordered input-sm w-full focus:input-primary"
                placeholder="Character name"
              />
            </FieldRow>

            {/* Level */}
            <FieldRow label="Level">
              <input
                type="number"
                min={1}
                max={100}
                value={character.level}
                disabled={saving}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) setCharacter({ ...character, level: val });
                }}
                className="input input-bordered input-sm w-full focus:input-primary"
              />
            </FieldRow>

            {/* Gender */}
            <FieldRow label="Gender">
              <select
                value={character.gender}
                disabled={saving}
                onChange={(e) => {
                  const val = e.target.value as "male" | "female";
                  setCharacter({ ...character, gender: val });
                }}
                className="select select-bordered select-sm w-full focus:select-primary"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </FieldRow>

            {/* Class (read-only) */}
            <FieldRow label="Class">
              <input
                type="text"
                value={characterClassName}
                disabled
                className="input input-bordered input-sm w-full bg-base-200 cursor-not-allowed"
              />
            </FieldRow>

            {/* Faction */}
            <FieldRow label="Faction">
              <select
                value={selectedFactionId || ""}
                disabled={saving}
                onChange={(e) => handleFactionChange(parseInt(e.target.value))}
                className="select select-bordered select-sm w-full focus:select-primary"
              >
                <option value="" disabled>
                  Select faction
                </option>
                {factions.map((faction) => (
                  <option key={faction.id} value={faction.id}>
                    {faction.name}
                  </option>
                ))}
              </select>
            </FieldRow>

            {/* Race */}
            <FieldRow label="Race">
              <select
                value={character.raceId || ""}
                disabled={saving || availableRaces.length === 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const picked = availableRaces.find((r) => r.id === val);
                  if (picked) {
                    setCharacter({
                      ...character,
                      raceId: val,
                      race: picked,
                    } as Character);
                  }
                }}
                className={`select select-bordered select-sm w-full focus:select-primary ${
                  factionChanged &&
                  (!character.raceId || character.raceId === 0)
                    ? "select-error"
                    : ""
                }`}
              >
                <option value="" disabled>
                  {availableRaces.length === 0
                    ? "No compatible races for this faction"
                    : "Select race"}
                </option>
                {availableRaces.map((race) => (
                  <option key={race.id} value={race.id}>
                    {race.name}
                  </option>
                ))}
              </select>
              {factionChanged &&
                (!character.raceId || character.raceId === 0) && (
                  <p className="text-xs text-error mt-1">
                    You must select a race after changing faction
                  </p>
                )}
            </FieldRow>

            {/* Specialization */}
            <FieldRow label="Specialization">
              <select
                value={character.specializationId || ""}
                disabled={saving}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  const picked = availableSpecializations.find(
                    (s) => s.id === val,
                  );
                  if (picked) {
                    setCharacter({
                      ...character,
                      specializationId: val,
                      specialization: picked,
                    } as Character);
                  }
                }}
                className="select select-bordered select-sm w-full focus:select-primary"
              >
                <option value="" disabled>
                  Select specialization
                </option>
                {availableSpecializations.map((spec) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </FieldRow>

            {/* Note */}
            <FieldRow label="Note">
              <textarea
                value={character.note}
                disabled={saving}
                placeholder="Write a note about this character…"
                rows={3}
                onChange={(e) =>
                  setCharacter({ ...character, note: e.target.value })
                }
                className="textarea textarea-bordered textarea-sm w-full focus:textarea-primary resize-none"
              />
            </FieldRow>
          </div>

          {/* ---- Action buttons ---- */}
          <div className="px-6 py-4 bg-base-200/50 border-t border-base-300 flex items-center justify-between gap-3">
            <button
              onClick={handleDelete}
              className="btn btn-error btn-outline btn-sm hover:btn-error"
              disabled={saving}
            >
              Delete Character
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={
                !hasUnsavedChanges ||
                saving ||
                (factionChanged &&
                  (!character.raceId || character.raceId === 0))
              }
              className="btn btn-primary btn-sm"
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>

          {/* ---- Footer metadata ---- */}
          <div className="px-6 py-2 bg-base-300/30 border-t border-base-300">
            <span className="text-xs text-base-content/40">
              Character ID: {character.id}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small reusable layout wrapper for a label + control
// ---------------------------------------------------------------------------
function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4">
      <label className="text-sm font-medium text-base-content/70 sm:w-32 flex-shrink-0 sm:pt-2">
        {label}
      </label>
      <div className="flex-grow">{children}</div>
    </div>
  );
}
