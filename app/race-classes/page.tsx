"use client";

import { useState, useEffect } from "react";
import { raceImages } from "@/services/imageMaps";
import Race from "@/services/Interfaces/Race";
import Faction from "@/services/Interfaces/Faction";
import Class from "@/services/Interfaces/Class";
import RaceClass from "@/services/Interfaces/RaceClass";

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

  useEffect(() => {
    fetchRaceClasses();
  }, []);

  useEffect(() => {
    groupRaceClasses();
  }, [raceClasses]);

  const fetchRaceClasses = async () => {
    setLoading(true);
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

    try {
      const response = await fetch(`/api/race-classes/${raceId}/${classId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete race-class relationship");
      }

      // Refresh the data
      fetchRaceClasses();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete relationship"
      );
    }
  };

  const getTotalClasses = (): number => {
    return Object.values(groupedData).reduce(
      (total, group) => total + group.classes.length,
      0
    );
  };

  const getFactionBadgeColor = (faction?: Faction): string => {
    if (!faction) return "badge-secondary";
    return faction.id === 1
      ? "badge-info"
      : faction.id === 2
      ? "badge-error"
      : "badge-secondary";
  };

  const getFactionAvatarBorder = (faction?: Faction): string => {
    if (!faction) return "ring-2 ring-base-300";
    return faction.id === 1
      ? "ring-2 ring-info"
      : faction.id === 2
      ? "ring-2 ring-error"
      : "ring-2 ring-base-300";
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
              <div
                key={group.race.id}
                className="card bg-base-100 shadow-md border border-base-300"
              >
                <div className="card-body">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {/* Race Portrait */}
                      <div className="avatar">
                        <div
                          className={`w-12 h-12 rounded-full ${getFactionAvatarBorder(
                            group.race.faction
                          )}`}
                        >
                          <img
                            src={
                              raceImages[group.race.slug] ||
                              "/placeholder-race.jpg"
                            }
                            alt={group.race.name}
                            className="w-full h-full object-cover rounded-full"
                          />
                        </div>
                      </div>
                      <h2 className="card-title text-xl text-base-content">
                        {group.race.name}
                      </h2>
                      {group.race.faction && (
                        <div
                          className={`badge ${getFactionBadgeColor(
                            group.race.faction
                          )}`}
                        >
                          {group.race.faction.name}
                        </div>
                      )}
                    </div>
                    <div className="badge badge-outline">
                      {group.classes.length}{" "}
                      {group.classes.length === 1 ? "class" : "classes"}
                    </div>
                  </div>

                  <div className="divider my-2"></div>

                  <div className="flex flex-wrap gap-2">
                    {group.classes.map((cls: Class) => (
                      <div
                        key={cls.id}
                        className="badge badge-lg gap-2 p-3 bg-base-100 border-2"
                        style={{
                          color: cls.colorCode,
                          borderColor: cls.colorCode,
                          backgroundColor: "var(--b1)",
                        }}
                      >
                        <span>{cls.name}</span>
                        <button
                          className="btn btn-ghost btn-xs hover:text-error"
                          style={{ color: cls.colorCode }}
                          onClick={() =>
                            handleDeleteRaceClass(group.race.id, cls.id)
                          }
                          title="Remove this class from race"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>

                  {group.classes.length === 0 && (
                    <div className="text-center py-4">
                      <span className="text-base-content/50">
                        No classes associated with this race
                      </span>
                    </div>
                  )}
                </div>
              </div>
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
