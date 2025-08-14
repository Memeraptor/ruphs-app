"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Race from "@/services/Interfaces/Race";
import Class from "@/services/Interfaces/Class";

interface BulkRaceClassFormProps {
  onSuccess?: (data: unknown) => void;
  onError?: (error: string) => void;
}

export default function BulkRaceClassForm({
  onSuccess,
  onError,
}: BulkRaceClassFormProps) {
  const router = useRouter();
  const [races, setRaces] = useState<Race[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedRaceId, setSelectedRaceId] = useState<number | null>(null);
  const [selectedClassIds, setSelectedClassIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchRacesAndClasses = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch races
      const racesResponse = await fetch("/api/races");
      if (!racesResponse.ok) throw new Error("Failed to fetch races");
      const racesData = await racesResponse.json();
      setRaces(racesData);

      // Fetch classes
      const classesResponse = await fetch("/api/classes");
      if (!classesResponse.ok) throw new Error("Failed to fetch classes");
      const classesData = await classesResponse.json();
      setClasses(classesData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  // Fetch races and classes on component mount
  useEffect(() => {
    fetchRacesAndClasses();
  }, [fetchRacesAndClasses]);

  const handleClassToggle = (classId: number) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSelectAllClasses = () => {
    if (selectedClassIds.length === classes.length) {
      setSelectedClassIds([]);
    } else {
      setSelectedClassIds(classes.map((c) => c.id));
    }
  };

  const handleSubmit = async () => {
    if (!selectedRaceId) {
      setError("Please select a race");
      return;
    }

    if (selectedClassIds.length === 0) {
      setError("Please select at least one class");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/race-classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          raceId: selectedRaceId,
          classIds: selectedClassIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create race-class relationships"
        );
      }

      const successMessage =
        data.message || "Race-class relationships created successfully";
      setSuccess(successMessage);
      onSuccess?.(data);

      // Reset form
      setSelectedRaceId(null);
      setSelectedClassIds([]);

      // Navigate to race-classes page after a short delay
      setTimeout(() => {
        router.push("/race-classes");
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create relationships";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedRaceId(null);
    setSelectedClassIds([]);
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="card bg-base-100 shadow-xl max-w-2xl mx-auto">
        <div className="card-body">
          <div className="flex items-center justify-center p-8">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <span className="ml-4 text-base-content">
              Loading races and classes...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl max-w-fit mx-auto">
      <div className="card-body">
        <h2 className="card-title text-2xl text-base-content mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          Bulk Race-Class Association
        </h2>

        <div className="space-y-6">
          {/* Race Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Select Race</span>
              <span className="label-text-alt text-error">*</span>
            </label>
            <select
              className="select select-bordered w-full focus:select-primary"
              value={selectedRaceId || ""}
              onChange={(e) =>
                setSelectedRaceId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="" disabled>
                Choose a race...
              </option>
              {races.map((race) => (
                <option key={race.id} value={race.id}>
                  {race.name} {race.faction && `(${race.faction.name})`}
                </option>
              ))}
            </select>
          </div>

          {/* Classes Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">
                Select Classes ({selectedClassIds.length} selected)
              </span>
              <span className="label-text-alt text-error">*</span>
            </label>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-base-content/70">
                Choose the classes to associate with the selected race
              </span>
              <button
                type="button"
                onClick={handleSelectAllClasses}
                className="btn btn-ghost btn-sm text-primary hover:text-primary-focus"
              >
                {selectedClassIds.length === classes.length
                  ? "Deselect All"
                  : "Select All"}
              </button>
            </div>

            <div className="card bg-base-200 border border-base-300 max-h-[500px] overflow-y-auto">
              {classes.length === 0 ? (
                <div className="card-body text-center">
                  <span className="text-base-content/50">
                    No classes available
                  </span>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-4">
                    {classes.map((classItem) => {
                      const isSelected = selectedClassIds.includes(
                        classItem.id
                      );
                      return (
                        <label
                          key={classItem.id}
                          className="cursor-pointer hover:bg-base-300 rounded-lg p-3 transition-colors flex items-center justify-center"
                        >
                          <div
                            className={`badge badge-xl flex items-center gap-3 transition-all w-full justify-between py-3 px-4 min-h-[50px] min-w-[140px] ${
                              isSelected ? "" : "bg-transparent border-2"
                            }`}
                            style={{
                              backgroundColor: isSelected
                                ? classItem.colorCode
                                : "transparent",
                              borderColor: classItem.colorCode,
                              color: isSelected ? "black" : "inherit",
                            }}
                          >
                            <span className="text-sm font-medium flex-1 text-center leading-tight">
                              {classItem.name}
                            </span>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleClassToggle(classItem.id)}
                              className="checkbox checkbox-sm flex-shrink-0"
                              style={{
                                accentColor: isSelected
                                  ? "black"
                                  : classItem.colorCode,
                              }}
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert alert-error">
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
              <div>
                <h3 className="font-bold">Error!</h3>
                <div className="text-xs">{error}</div>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="alert alert-success">
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
              <div>
                <h3 className="font-bold">Success!</h3>
                <div className="text-xs">{success}</div>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          {submitting && (
            <div className="alert alert-info">
              <span className="loading loading-spinner loading-sm"></span>
              <span>Creating race-class relationships...</span>
            </div>
          )}

          {/* Selected Items Preview */}
          {selectedRaceId && selectedClassIds.length > 0 && (
            <div className="card bg-base-200 border border-base-300">
              <div className="card-body">
                <h4 className="font-semibold text-base-content mb-2">
                  Preview:
                </h4>
                <div className="flex flex-wrap gap-2 items-center">
                  <div className="badge badge-primary badge-lg">
                    {races.find((r) => r.id === selectedRaceId)?.name}
                  </div>
                  <span className="text-base-content/70">→</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedClassIds.map((classId) => {
                      const classItem = classes.find((c) => c.id === classId);
                      return (
                        <div
                          key={classId}
                          className="badge text-black"
                          style={{
                            backgroundColor: classItem?.colorCode || "#6b7280",
                          }}
                        >
                          {classItem?.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="card-actions justify-end gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-ghost"
              disabled={submitting}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Reset
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={
                submitting || !selectedRaceId || selectedClassIds.length === 0
              }
              className="btn btn-primary"
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create Associations
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
