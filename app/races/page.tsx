"use client";

import Race from "@/services/Interfaces/Race";
import Link from "next/link";
import { useEffect, useState } from "react";
import RacePortrait from "../components/RacePortrait";

function RacesLoading() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-full"></div>
      <div className="skeleton h-8 w-full"></div>
      <div className="skeleton h-8 w-full"></div>
    </div>
  );
}

function RacesList() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRaces();
  }, []);

  const fetchRaces = async () => {
    try {
      const response = await fetch("/api/races", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch races");
      }

      const data = await response.json();
      setRaces(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (raceId: number, raceName: string) => {
    if (!confirm(`Are you sure you want to delete the race "${raceName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/races/${raceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete race");
      }

      // Remove the race from the local state
      setRaces((prev) => prev.filter((race) => race.id !== raceId));
    } catch (err) {
      alert(
        "Error deleting race: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  if (loading) {
    return <RacesLoading />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
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
        </div>
        <button onClick={fetchRaces} className="btn btn-primary mt-4">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {races.length === 0 ? (
        <div className="hero min-h-96">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">No races found</h1>
              <p className="py-6 text-base-content/70">
                Create your first race to get started on your World of Warcraft
                character database!
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {races.map((race) => (
            <div
              key={race.id}
              className="card bg-base-100 shadow-xl  hover:shadow-2xl transition-all duration-300"
            >
              <div className="card-body">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    {/* Race Image */}
                    <RacePortrait race={race} />

                    {/* Race Information */}
                    <div className="flex-1">
                      <h2 className="card-title text-2xl mb-3">
                        {race.name}
                        <div
                          className={
                            race.factionId === 1
                              ? "badge badge-info"
                              : "badge badge-error"
                          }
                        >
                          {race.faction ? race.faction.name : "no faction"}
                        </div>
                      </h2>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="badge badge-outline badge-sm">
                            Slug:
                          </span>
                          <span className="text-base-content/70 font-mono text-sm">
                            {race.slug}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="card-actions">
                    <Link
                      href={`/races/${race.id}/edit`}
                      className="btn btn-primary btn-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </Link>
                    <button
                      className="btn btn-error btn-sm"
                      onClick={() => handleDelete(race.id, race.name)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RacesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-base-content">Races</h1>
        <Link href="/races/new" className="btn btn-primary gap-2">
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
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Create New Race
        </Link>
      </div>

      <RacesList />
    </div>
  );
}
