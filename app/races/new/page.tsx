"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Faction {
  id: number;
  name: string;
}

interface FormData {
  name: string;
  slug: string;
  factionId: string;
}

export default function NewRacePage() {
  const router = useRouter();
  const [factions, setFactions] = useState<Faction[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    slug: "",
    factionId: "",
  });

  useEffect(() => {
    fetchFactions();
  }, []);

  const fetchFactions = async () => {
    try {
      const response = await fetch("/api/factions");
      if (!response.ok) {
        throw new Error("Failed to fetch factions");
      }
      const data = await response.json();
      setFactions(data);
    } catch (err) {
      setError("Failed to load factions");
      console.error("Error fetching factions:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = generateSlug(e.target.value);
    setFormData((prev) => ({
      ...prev,
      slug,
    }));
  };

  const handleFactionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      factionId: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/races", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          factionId: parseInt(formData.factionId),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create race");
      }

      // Redirect to races list on success
      router.push("/races");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-base-300 rounded mb-4"></div>
            <div className="h-4 bg-base-300 rounded mb-2"></div>
            <div className="h-12 bg-base-300 rounded mb-4"></div>
            <div className="h-4 bg-base-300 rounded mb-2"></div>
            <div className="h-12 bg-base-300 rounded mb-4"></div>
            <div className="h-4 bg-base-300 rounded mb-2"></div>
            <div className="h-12 bg-base-300 rounded mb-4"></div>
            <div className="h-12 bg-base-300 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-base-content">
                  Create New Race
                </h1>
                <Link
                  href="/races"
                  className="btn btn-ghost btn-sm text-primary hover:text-primary-focus"
                >
                  ← Back to Races
                </Link>
              </div>

              {error && (
                <div className="alert alert-error mb-6">
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

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="form-control">
                  <div className="flex justify-between items-center">
                    <span className="label-text text-base-content">
                      Race Name *
                    </span>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={handleNameChange}
                      required
                      className="input input-bordered bg-base-100 text-base-content placeholder:text-base-content/60 focus:border-primary ml-auto"
                      placeholder="e.g., Human, Orc, Elf"
                    />
                  </div>
                </div>

                <div className="form-control">
                  <div className="flex justify-between items-center">
                    <span className="label-text text-base-content">Slug *</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={handleSlugChange}
                      required
                      className="input input-bordered bg-base-100 text-base-content placeholder:text-base-content/60 focus:border-primary ml-auto"
                      placeholder="e.g., human, orc, elf"
                    />
                  </div>
                  <label className="label">
                    <span className="label-text-alt text-base-content/70">
                      URL-friendly version of the name (auto-generated)
                    </span>
                  </label>
                </div>

                <div className="form-control">
                  <div className="flex justify-between items-center">
                    <span className="label-text text-base-content">
                      Faction *
                    </span>
                    <select
                      value={formData.factionId}
                      onChange={handleFactionChange}
                      required
                      className="select select-bordered bg-base-100 text-base-content focus:border-primary ml-auto"
                    >
                      <option value="" disabled>
                        Select a faction
                      </option>
                      {factions.map((faction) => (
                        <option key={faction.id} value={faction.id}>
                          {faction.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary flex-1"
                  >
                    {submitting ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating...
                      </>
                    ) : (
                      "Create Race"
                    )}
                  </button>
                  <Link href="/races" className="btn btn-neutral">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
