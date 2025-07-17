"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { classMap } from "../../services/imageMaps";

// Types based on your Prisma schema
interface Class {
  id: number;
  name: string;
  slug: string;
  armorType: string;
  colorCode: string;
}

interface Specialization {
  id: number;
  name: string;
  slug: string;
  classId: number;
  class: Class;
}

interface GroupedSpecializations {
  [className: string]: {
    class: Class;
    specializations: Specialization[];
  };
}

export default function SpecializationPage() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [filteredSpecializations, setFilteredSpecializations] = useState<
    Specialization[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Fetch specializations from API
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/specialization");
        if (!response.ok) {
          throw new Error("Failed to fetch specializations");
        }
        const data = await response.json();
        setSpecializations(data);
        setFilteredSpecializations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSpecializations();
  }, []);

  // Filter specializations based on search term and selected class
  useEffect(() => {
    let filtered = specializations;

    if (searchTerm) {
      filtered = filtered.filter(
        (spec) =>
          spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          spec.class.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedClass !== "all") {
      filtered = filtered.filter((spec) => spec.class.slug === selectedClass);
    }

    setFilteredSpecializations(filtered);
  }, [searchTerm, selectedClass, specializations]);

  // Group specializations by class
  const groupedSpecializations: GroupedSpecializations =
    filteredSpecializations.reduce((acc, spec) => {
      const className = spec.class.name;
      if (!acc[className]) {
        acc[className] = {
          class: spec.class,
          specializations: [],
        };
      }
      acc[className].specializations.push(spec);
      return acc;
    }, {} as GroupedSpecializations);

  // Get unique classes for filter dropdown
  const availableClasses = Array.from(
    new Set(specializations.map((spec) => spec.class.slug))
  )
    .map(
      (slug) => specializations.find((spec) => spec.class.slug === slug)?.class
    )
    .filter(Boolean) as Class[];

  const handleNewSpecialization = () => {
    router.push("/specialization/new");
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
          <span>Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-base-content mb-2">
              Specializations
            </h1>
            <p className="text-base-content/70">
              Explore different specializations grouped by their classes
            </p>
          </div>
          <button
            onClick={handleNewSpecialization}
            className="btn btn-primary mt-4 md:mt-0"
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
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add New Specialization
          </button>
        </div>

        {/* Filters */}
        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-lg mb-4">Filters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Search */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Search</span>
                </label>
                <input
                  type="text"
                  placeholder="Search specializations or classes..."
                  className="input input-bordered w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Class Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Filter by Class
                  </span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="all">All Classes</option>
                  {availableClasses.map((classItem) => (
                    <option key={classItem.slug} value={classItem.slug}>
                      {classItem.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-base-content/70">
            Showing {filteredSpecializations.length} of {specializations.length}{" "}
            specializations
          </p>
        </div>

        {/* Grouped Specializations */}
        {Object.keys(groupedSpecializations).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">
              No specializations found
            </h3>
            <p className="text-base-content/70">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedSpecializations).map(
              ([className, group]) => (
                <div key={className} className="space-y-4">
                  {/* Class Header */}
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg"
                      style={{
                        backgroundColor: group.class.colorCode || "#6B7280",
                      }}
                    >
                      {className.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-base-content">
                        {className}
                      </h2>
                      <p className="text-base-content/70">
                        {group.specializations.length} specialization
                        {group.specializations.length !== 1 ? "s" : ""}
                        {group.class.armorType && (
                          <span className="ml-2 badge badge-outline">
                            {group.class.armorType}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Specializations Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {group.specializations.map((specialization) => (
                      <div
                        key={specialization.id}
                        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                      >
                        {/* Background Image */}
                        <div
                          className="h-48 bg-gradient-to-br from-base-300 to-base-200 relative overflow-hidden"
                          style={{
                            backgroundImage: classMap[group.class.slug]
                              ? `url(${classMap[group.class.slug]})`
                              : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {/* Overlay */}
                          <div
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
                            style={{
                              background: group.class.colorCode
                                ? `linear-gradient(to top, ${group.class.colorCode}88, transparent)`
                                : "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                            }}
                          />

                          {/* Class Badge */}
                          <div className="absolute top-4 left-4">
                            <div
                              className="badge text-white border-none font-medium"
                              style={{
                                backgroundColor:
                                  group.class.colorCode || "#6B7280",
                                color: "white",
                              }}
                            >
                              {group.class.name}
                            </div>
                          </div>

                          {/* Armor Type Badge */}
                          {group.class.armorType && (
                            <div className="absolute top-4 right-4">
                              <div className="badge badge-ghost bg-black/20 text-white border-none">
                                {group.class.armorType}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Card Content */}
                        <div className="card-body p-6">
                          <h3 className="card-title text-lg mb-2">
                            {specialization.name}
                          </h3>

                          {/* Specialization slug as subtitle */}
                          <p className="text-base-content/50 text-sm mb-4">
                            {specialization.slug}
                          </p>

                          <div className="card-actions justify-end">
                            <button
                              className="btn btn-primary btn-sm"
                              style={{
                                backgroundColor:
                                  group.class.colorCode || "#6B7280",
                                borderColor: group.class.colorCode || "#6B7280",
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
