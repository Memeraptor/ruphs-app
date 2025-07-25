"use client";

import Class from "@/services/Interfaces/Class";
import Faction from "@/services/Interfaces/Faction";
import Race from "@/services/Interfaces/Race";
import RaceClass from "@/services/Interfaces/RaceClass";
import { useEffect, useState } from "react";
import RaceClassCard from "../components/RaceClassCard";
import ClassBadge from "../components/ClassBadge";

interface GroupedRaceClasses {
  [raceId: number]: {
    race: Race;
    classes: Class[];
  };
}

export default function RaceClassesViewPage() {
  const [raceClasses, setRaceClasses] = useState<RaceClass[]>([]);
  const [groupedData, setGroupedData] = useState<GroupedRaceClasses>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaction, setSelectedFaction] = useState<string>("");
  const [factions, setFactions] = useState<Faction[]>([]);
  const [deletingItems, setDeletingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchRaceClasses();
  }, []);

  useEffect(() => {
    groupRaceClasses();
  }, [raceClasses]);

  const fetchRaceClasses = async () => {
    setLoading(true);
    setError(null); // Clear any previous errors
    try {
      const response = await fetch(
        "/api/race-classes?includeRace=true&includeClass=true"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch race-class relationships");
      }
      const data: RaceClass[] = await response.json();
      setRaceClasses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const groupRaceClasses = () => {
    const grouped: GroupedRaceClasses = {};
    const factionsSet = new Set<string>();

    raceClasses.forEach((raceClass) => {
      const raceId = raceClass.raceId;

      if (!grouped[raceId]) {
        grouped[raceId] = {
          race: raceClass.race,
          classes: [],
        };
      }

      grouped[raceId].classes.push(raceClass.class);

      // Collect unique factions
      if (raceClass.race.faction) {
        factionsSet.add(JSON.stringify(raceClass.race.faction));
      }
    });

    // Sort classes within each race
    Object.values(grouped).forEach((group) => {
      group.classes.sort((a: Class, b: Class) => a.name.localeCompare(b.name));
    });

    setGroupedData(grouped);

    // Set factions for filtering
    const uniqueFactions: Faction[] = Array.from(factionsSet).map((f) =>
      JSON.parse(f)
    );
    setFactions(uniqueFactions);
  };

  const filteredData = Object.values(groupedData)
    .filter((group) => {
      const matchesSearch =
        group.race.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.classes.some((cls: Class) =>
          cls.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesFaction =
        !selectedFaction ||
        (group.race.faction && group.race.faction.name === selectedFaction);

      return matchesSearch && matchesFaction;
    })
    .sort((a, b) => a.race.name.localeCompare(b.race.name));

  const handleDeleteRaceClass = async (raceId: number, classId: number) => {
    if (
      !confirm("Are you sure you want to delete this race-class relationship?")
    ) {
      return;
    }

    const deleteKey = `${raceId}-${classId}`;
    setDeletingItems((prev) => new Set(prev).add(deleteKey));
    setError(null); // Clear any previous errors

    try {
      const response = await fetch(`/api/race-classes/${raceId}/${classId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error ||
            `Failed to delete race-class relationship (${response.status})`
        );
      }

      // Show success message (optional)
      const result = await response.json();
      console.log("Delete successful:", result.message);

      // Refresh the data
      await fetchRaceClasses();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete relationship";
      setError(errorMessage);
      console.error("Delete error:", err);
    } finally {
      setDeletingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(deleteKey);
        return newSet;
      });
    }
  };

  const getTotalClasses = (): number => {
    return Object.values(groupedData).reduce(
      (total, group) => total + group.classes.length,
      0
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-base-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <span className="ml-4 text-base-content">
              Loading race-class relationships...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-base-100 p-4">
        <div className="max-w-6xl mx-auto">
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
            <span>Error: {error}</span>
            <div>
              <button
                className="btn btn-sm btn-outline"
                onClick={fetchRaceClasses}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-base-content mb-2">
                Race-Class Relationships
              </h1>
              <div className="text-base-content/70">
                Manage and view race-class associations in your system
              </div>
            </div>
            <div>
              <a href="/race-classes/new" className="btn btn-primary">
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
                New Association
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="stats shadow mb-6 w-full">
          <div className="stat">
            <div className="stat-title">Total Races</div>
            <div className="stat-value text-primary">
              {Object.keys(groupedData).length}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Relationships</div>
            <div className="stat-value text-secondary">{getTotalClasses()}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Available Factions</div>
            <div className="stat-value text-accent">{factions.length}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card bg-base-200 shadow-sm mb-6">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">Search races or classes</span>
                </label>
                <input
                  type="text"
                  placeholder="Search..."
                  className="input input-bordered w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="form-control flex-1">
                <label className="label">
                  <span className="label-text">Filter by faction</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedFaction}
                  onChange={(e) => setSelectedFaction(e.target.value)}
                >
                  <option value="">All factions</option>
                  {factions.map((faction) => (
                    <option key={faction.id} value={faction.name}>
                      {faction.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">&nbsp;</span>
                </label>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedFaction("");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert (if not loading) */}
        {error && !loading && (
          <div className="alert alert-warning mb-6">
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            <span>{error}</span>
            <button
              className="btn btn-sm btn-outline"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Race-Class Groups */}
        {filteredData.length === 0 ? (
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body text-center">
              <h2 className="card-title justify-center text-base-content/70">
                No race-class relationships found
              </h2>
              <p className="text-base-content/50">
                {searchTerm || selectedFaction
                  ? "Try adjusting your filters"
                  : "No data available"}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredData.map((group) => (
              <RaceClassCard
                key={group.race.id}
                race={group.race}
                classCount={group.classes.length}
              >
                {group.classes.map((cls: Class) => {
                  const deleteKey = `${group.race.id}-${cls.id}`;
                  const isDeleting = deletingItems.has(deleteKey);

                  return (
                    <ClassBadge
                      key={cls.id}
                      cls={cls}
                      onDelete={() =>
                        handleDeleteRaceClass(group.race.id, cls.id)
                      }
                      isDeleting={isDeleting}
                    />
                  );
                })}
              </RaceClassCard>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            className="btn btn-primary"
            onClick={fetchRaceClasses}
            disabled={loading}
          >
            {loading && <span className="loading loading-spinner"></span>}
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
