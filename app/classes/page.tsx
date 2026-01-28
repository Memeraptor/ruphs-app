"use client";

import { classMap } from "@/services/imageMaps/classIconMap";
import Class from "@/services/Interfaces/Class";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

export default function ClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    armorType: "",
    includeRaces: false,
    includeSpecializations: false,
  });

  // Fetch classes from API
  const fetchClasses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.armorType) params.append("armorType", filters.armorType);
      if (filters.includeRaces) params.append("includeRaces", "true");
      if (filters.includeSpecializations)
        params.append("includeSpecializations", "true");

      const response = await fetch(`/api/classes?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch classes");
      }

      const data = await response.json();
      setClasses(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const getArmorTypeIcon = (armorType: string) => {
    switch (armorType.toLowerCase()) {
      case "cloth":
        return "🧙‍♂️";
      case "leather":
        return "🏹";
      case "mail":
        return "⚔️";
      case "plate":
        return "🛡️";
      default:
        return "🎭";
    }
  };

  const getArmorTypeBadgeColor = (armorType: string) => {
    switch (armorType.toLowerCase()) {
      case "cloth":
        return "badge-primary";
      case "leather":
        return "badge-secondary";
      case "mail":
        return "badge-accent";
      case "plate":
        return "badge-neutral";
      default:
        return "badge-ghost";
    }
  };

  const getClassImage = (slug: string): string | null => {
    return classMap[slug] || null;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-96">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
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
          <span>Error loading classes: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">Player Classes</h1>
            <p className="text-base-content/70">Manage your classes</p>
          </div>
          <button
            className="btn btn-primary gap-2"
            onClick={() => router.push("/classes/new")}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
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
            Create New Class
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-base-100 shadow-xl mb-8">
        <div className="card-body">
          <h2 className="card-title">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Armor Type Filter */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Armor Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={filters.armorType}
                onChange={(e) =>
                  handleFilterChange("armorType", e.target.value)
                }
              >
                <option value="">All Armor Types</option>
                <option value="cloth">Cloth</option>
                <option value="leather">Leather</option>
                <option value="mail">Mail</option>
                <option value="plate">Plate</option>
              </select>
            </div>

            {/* Include Options */}
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Include Races</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={filters.includeRaces}
                  onChange={(e) =>
                    handleFilterChange("includeRaces", e.target.checked)
                  }
                />
              </label>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">Include Specializations</span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={filters.includeSpecializations}
                  onChange={(e) =>
                    handleFilterChange(
                      "includeSpecializations",
                      e.target.checked,
                    )
                  }
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {classes.map((playerClass) => {
          const classImage = getClassImage(playerClass.slug);

          return (
            <div
              key={playerClass.id}
              className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group relative"
            >
              {/* Background Image */}
              {classImage && (
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 group-hover:opacity-30 transition-opacity duration-300"
                  style={{ backgroundImage: `url(${classImage})` }}
                />
              )}

              {/* Gradient overlay for better text readability */}
              {/* <div className="absolute inset-0 bg-gradient-to-t from-base-100/90 via-transparent to-transparent" /> */}

              <div
                className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                style={{
                  background: playerClass.colorCode
                    ? `linear-gradient(to top, ${playerClass.colorCode}33, transparent)`
                    : "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                }}
              />

              {/* Card Content */}
              <div className="card-body relative z-10">
                {/* Class Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="card-title text-xl">
                    <span className="text-2xl mr-2">
                      {getArmorTypeIcon(playerClass.armorType)}
                    </span>
                    {playerClass.name}
                  </h2>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-base-content/20 shadow-lg"
                    style={{ backgroundColor: playerClass.colorCode }}
                    title={`Color: ${playerClass.colorCode}`}
                  ></div>
                </div>

                {/* Armor Type Badge */}
                <div className="mb-4">
                  <div
                    className={`badge ${getArmorTypeBadgeColor(
                      playerClass.armorType,
                    )} gap-2`}
                  >
                    {playerClass.armorType}
                  </div>
                </div>

                {/* Races */}
                {filters.includeRaces &&
                  playerClass.races &&
                  playerClass.races.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-sm mb-2">
                        Available Races:
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {playerClass.races.map((classRace) => (
                          <div
                            key={classRace.id}
                            className="badge badge-outline badge-sm"
                          >
                            {classRace.race.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Specializations */}
                {filters.includeSpecializations &&
                  playerClass.specializations &&
                  playerClass.specializations.length > 0 && (
                    <div className="mb-4">
                      <h3 className="font-semibold text-sm mb-2">
                        Specializations:
                      </h3>
                      <div className="flex flex-wrap gap-1">
                        {playerClass.specializations.map((spec) => (
                          <div
                            key={spec.id}
                            className="badge badge-secondary badge-sm"
                          >
                            {spec.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Actions */}
                <div className="card-actions justify-end mt-4">
                  {/* <button className="btn btn-primary btn-sm">
                    View Details
                  </button> */}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {classes.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎭</div>
          <h3 className="text-2xl font-bold mb-2">No Classes Found</h3>
          <p className="text-base-content/70">
            No player classes match your current filters. Try adjusting your
            search criteria.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="stats shadow mt-8 w-full">
        <div className="stat">
          <div className="stat-title">Total Classes</div>
          <div className="stat-value">{classes.length}</div>
          <div className="stat-desc">Available player classes</div>
        </div>

        <div className="stat">
          <div className="stat-title">Armor Types</div>
          <div className="stat-value">
            {new Set(classes.map((c) => c.armorType)).size}
          </div>
          <div className="stat-desc">Different armor types</div>
        </div>

        {filters.includeRaces && (
          <div className="stat">
            <div className="stat-title">Total Races</div>
            <div className="stat-value">
              {classes.reduce((acc, c) => acc + (c.races?.length || 0), 0)}
            </div>
            <div className="stat-desc">Race combinations</div>
          </div>
        )}

        {filters.includeSpecializations && (
          <div className="stat">
            <div className="stat-title">Specializations</div>
            <div className="stat-value">
              {classes.reduce(
                (acc, c) => acc + (c.specializations?.length || 0),
                0,
              )}
            </div>
            <div className="stat-desc">Total specializations</div>
          </div>
        )}
      </div>
    </div>
  );
}
