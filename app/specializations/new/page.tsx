"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Class {
  id: number;
  name: string;
  slug: string;
  armorType: string;
  colorCode: string;
}

interface SpecializationInput {
  name: string;
  slug: string;
}

export default function NewSpecializationPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [specializations, setSpecializations] = useState<SpecializationInput[]>(
    [{ name: "", slug: "" }]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch classes on component mount
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes"); // Adjust endpoint as needed

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          "Response is not JSON - check if /api/classes endpoint exists"
        );
      }

      const data = await response.json();
      setClasses(data);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError(
        "Failed to load classes. Please ensure the /api/classes endpoint is properly configured."
      );

      // Fallback: Set some dummy data for development
      setClasses([
        {
          id: 1,
          name: "Warrior",
          slug: "warrior",
          armorType: "Heavy",
          colorCode: "#FF0000",
        },
        {
          id: 2,
          name: "Mage",
          slug: "mage",
          armorType: "Light",
          colorCode: "#0000FF",
        },
        {
          id: 3,
          name: "Rogue",
          slug: "rogue",
          armorType: "Medium",
          colorCode: "#00FF00",
        },
      ]);
    }
  };

  // Generate camelCase slug from name
  const generateCamelCaseSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, "") // Remove special characters except spaces
      .split(/\s+/) // Split by spaces
      .map((word, index) => {
        if (index === 0) return word; // First word stays lowercase
        return word.charAt(0).toUpperCase() + word.slice(1); // Capitalize first letter of subsequent words
      })
      .join(""); // Join without separators
  };

  // Handle name change and auto-generate slug
  const handleNameChange = (index: number, name: string) => {
    const newSpecializations = [...specializations];
    newSpecializations[index] = {
      name,
      slug: generateCamelCaseSlug(name),
    };
    setSpecializations(newSpecializations);
  };

  // Handle slug manual change
  const handleSlugChange = (index: number, slug: string) => {
    const newSpecializations = [...specializations];
    newSpecializations[index].slug = slug;
    setSpecializations(newSpecializations);
  };

  // Add new specialization field
  const addSpecializationField = () => {
    setSpecializations([...specializations, { name: "", slug: "" }]);
  };

  // Remove specialization field
  const removeSpecializationField = (index: number) => {
    if (specializations.length > 1) {
      const newSpecializations = specializations.filter((_, i) => i !== index);
      setSpecializations(newSpecializations);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClassId) {
      setError("Please select a class");
      return;
    }

    const validSpecializations = specializations.filter(
      (spec) => spec.name.trim() && spec.slug.trim()
    );

    if (validSpecializations.length === 0) {
      setError("Please add at least one specialization");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/specializations", {
        method: "PUT", // Using PUT for bulk creation
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classId: selectedClassId,
          specializations: validSpecializations,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to create specializations"
          );
        } else {
          throw new Error(
            `HTTP error! status: ${response.status} - Check if /api/specializations endpoint exists`
          );
        }
      }

      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        await response.json(); // Parse success response
      }

      // Success - redirect to specializations list or show success message
      router.push("/specializations"); // Adjust path as needed
    } catch (err) {
      console.error("Submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while creating specializations"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Specializations</h1>
        <p className="text-base-content/70">
          Add new specializations to a class. Names will automatically generate
          camelCase slugs.
        </p>
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
        {/* Class Selection */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Select Class *</span>
          </label>
          <select
            value={selectedClassId || ""}
            onChange={(e) =>
              setSelectedClassId(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            className="select select-bordered w-full"
            required
          >
            <option value="">Choose a class...</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {/* Specializations */}
        <div className="form-control w-full">
          <label className="label">
            <span className="label-text font-medium">Specializations *</span>
          </label>

          <div className="space-y-4">
            {specializations.map((spec, index) => (
              <div key={index} className="card bg-base-200 shadow-sm">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="card-title text-sm">
                      Specialization {index + 1}
                    </h3>
                    {specializations.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecializationField(index)}
                        className="btn btn-ghost btn-sm text-error hover:bg-error/10"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Name *</span>
                      </label>
                      <input
                        type="text"
                        value={spec.name}
                        onChange={(e) =>
                          handleNameChange(index, e.target.value)
                        }
                        placeholder="e.g., Fire Mage"
                        className="input input-bordered w-full"
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Slug *</span>
                      </label>
                      <input
                        type="text"
                        value={spec.slug}
                        onChange={(e) =>
                          handleSlugChange(index, e.target.value)
                        }
                        placeholder="e.g., fireMage"
                        className="input input-bordered w-full font-mono text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Specialization Button */}
            <button
              type="button"
              onClick={addSpecializationField}
              className="btn btn-outline btn-primary w-full"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Specialization
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn btn-ghost order-2 sm:order-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !selectedClassId}
            className="btn btn-primary order-1 sm:order-2"
          >
            {isLoading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            {isLoading ? "Creating..." : "Create Specializations"}
          </button>
        </div>
      </form>
    </div>
  );
}
