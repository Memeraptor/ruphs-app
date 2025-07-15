"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateClassData {
  name: string;
  slug: string;
  armorType: string;
  colorCode: string;
}

export default function NewClassPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateClassData>({
    name: "",
    slug: "",
    armorType: "",
    colorCode: "#000000",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create class");
      }

      setSuccess("Class created successfully!");

      // Reset form
      setFormData({
        name: "",
        slug: "",
        armorType: "",
        colorCode: "#000000",
      });

      // Redirect to classes page after 2 seconds
      setTimeout(() => {
        router.push("/classes");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const armorTypes = [
    { value: "cloth", label: "Cloth", icon: "🧙‍♂️" },
    { value: "leather", label: "Leather", icon: "🏹" },
    { value: "mail", label: "Mail", icon: "⚔️" },
    { value: "plate", label: "Plate", icon: "🛡️" },
  ];

  const predefinedColors = [
    "#8B5CF6",
    "#EC4899",
    "#F59E0B",
    "#10B981",
    "#3B82F6",
    "#EF4444",
    "#6366F1",
    "#F97316",
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            className="btn btn-ghost btn-circle"
            onClick={() => router.back()}
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <div>
            <h1 className="text-3xl font-bold">Create New Class</h1>
            <p className="text-base-content/70">
              Add a new player class to the game
            </p>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {success && (
        <div className="alert alert-success mb-6">
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

      {/* Error Alert */}
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

      {/* Form */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Class Name *</span>
              </label>
              <input
                type="text"
                placeholder="Enter class name (e.g., Warrior, Mage)"
                className="input input-bordered w-full"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            {/* Slug (Auto-generated) */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Slug</span>
                <span className="label-text-alt">Auto-generated from name</span>
              </label>
              <input
                type="text"
                placeholder="class-slug"
                className="input input-bordered w-full"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                required
              />
            </div>

            {/* Armor Type */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Armor Type *</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {armorTypes.map((armor) => (
                  <label key={armor.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="armorType"
                      value={armor.value}
                      checked={formData.armorType === armor.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          armorType: e.target.value,
                        }))
                      }
                      className="sr-only"
                    />
                    <div
                      className={`card compact bg-base-200 transition-all ${
                        formData.armorType === armor.value
                          ? "ring-2 ring-primary bg-primary/10"
                          : "hover:bg-base-300"
                      }`}
                    >
                      <div className="card-body items-center text-center">
                        <div className="text-2xl">{armor.icon}</div>
                        <div className="text-sm font-medium">{armor.label}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Color Code */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Class Color *</span>
              </label>

              {/* Color Picker */}
              <div className="flex items-center gap-4 mb-3">
                <input
                  type="color"
                  className="w-16 h-12 rounded-lg border border-base-300 cursor-pointer"
                  value={formData.colorCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      colorCode: e.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="#000000"
                  className="input input-bordered flex-1"
                  value={formData.colorCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      colorCode: e.target.value,
                    }))
                  }
                  pattern="^#[0-9A-Fa-f]{6}$"
                  required
                />
              </div>

              {/* Predefined Colors */}
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-base-content/70 mb-1 w-full">
                  Quick colors:
                </span>
                {predefinedColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      formData.colorCode === color
                        ? "border-primary scale-110"
                        : "border-base-300 hover:border-primary"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, colorCode: color }))
                    }
                  />
                ))}
              </div>
            </div>

            {/* Preview */}
            {formData.name && formData.armorType && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Preview</span>
                </label>
                <div className="card bg-base-200 shadow-sm">
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <h3 className="card-title">
                        <span className="text-2xl mr-2">
                          {
                            armorTypes.find(
                              (a) => a.value === formData.armorType
                            )?.icon
                          }
                        </span>
                        {formData.name}
                      </h3>
                      <div
                        className="w-6 h-6 rounded-full border-2 border-base-content/20"
                        style={{ backgroundColor: formData.colorCode }}
                      ></div>
                    </div>
                    <div className="badge badge-outline">
                      {formData.armorType}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="form-control">
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={loading || !formData.name || !formData.armorType}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Creating Class...
                  </>
                ) : (
                  "Create Class"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 text-center">
        <button
          className="btn btn-ghost"
          onClick={() => router.push("/classes")}
        >
          ← Back to Classes
        </button>
      </div>
    </div>
  );
}
