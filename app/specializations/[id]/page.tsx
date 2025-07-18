"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { classMap } from "@/services/imageMaps";
import Specialization from "@/services/Interfaces/Specialization";

interface EditFormData {
  name: string;
  slug: string;
  classId: number;
}

export default function SpecializationPage() {
  const params = useParams();
  const router = useRouter();
  const [specialization, setSpecialization] = useState<Specialization | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<EditFormData>({
    name: "",
    slug: "",
    classId: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSpecialization();
  }, [params.id]);

  const fetchSpecialization = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/specializations/${params.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch specialization");
      }

      const data = await response.json();
      setSpecialization(data);
      setEditForm({
        name: data.name,
        slug: data.slug,
        classId: data.classId,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    if (specialization) {
      setEditForm({
        name: specialization.name,
        slug: specialization.slug,
        classId: specialization.classId,
      });
    }
  };

  const handleSave = async () => {
    if (!specialization) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/specializations/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update specialization");
      }

      const updatedSpecialization = await response.json();
      setSpecialization(updatedSpecialization);
      setEditMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (
    field: keyof EditFormData,
    value: string | number
  ) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!specialization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="alert alert-warning max-w-md">
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
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <span>Specialization not found</span>
        </div>
      </div>
    );
  }

  const classImageUrl =
    classMap[specialization.class.slug] || "/images/default-class.png";

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header Section */}
      <div className="bg-base-100 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-6">
            {/* Class Image */}
            <div className="relative">
              <div
                className="w-24 h-24 rounded-xl bg-cover bg-center shadow-lg"
                style={{ backgroundImage: `url(${classImageUrl})` }}
              ></div>
              <div
                className="absolute inset-0 rounded-xl"
                style={{
                  background: `linear-gradient(135deg, ${specialization.class.colorCode}80, transparent)`,
                }}
              ></div>
            </div>

            {/* Specialization Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-base-content mb-2">
                {specialization.name}
              </h1>
              <div className="flex items-center gap-3">
                <div
                  className="badge badge-lg text-white font-medium"
                  style={{ backgroundColor: specialization.class.colorCode }}
                >
                  {specialization.class.name}
                </div>
                <div className="text-sm text-base-content/60">
                  ID: {specialization.id}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Action Buttons */}
          <div className="flex justify-between items-center mb-6">
            <button className="btn btn-ghost" onClick={() => router.back()}>
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
                  strokeWidth="2"
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back
            </button>

            <div className="flex gap-2">
              {editMode ? (
                <>
                  <button
                    className="btn btn-ghost"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn text-white"
                    style={{ backgroundColor: specialization.class.colorCode }}
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </>
              ) : (
                <button
                  className="btn text-white"
                  style={{ backgroundColor: specialization.class.colorCode }}
                  onClick={handleEdit}
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
                      strokeWidth="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Main Content Card */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-6">
                Specialization Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Name</span>
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={editForm.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter specialization name"
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg">
                      {specialization.name}
                    </div>
                  )}
                </div>

                {/* Slug Field */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">Slug</span>
                  </label>
                  {editMode ? (
                    <input
                      type="text"
                      className="input input-bordered w-full"
                      value={editForm.slug}
                      onChange={(e) =>
                        handleInputChange("slug", e.target.value)
                      }
                      placeholder="Enter specialization slug"
                    />
                  ) : (
                    <div className="p-3 bg-base-200 rounded-lg font-mono text-sm">
                      {specialization.slug}
                    </div>
                  )}
                </div>

                {/* Class Field */}
                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-semibold">Class</span>
                  </label>
                  <div className="flex items-center gap-4 p-3 bg-base-200 rounded-lg">
                    <div
                      className="w-12 h-12 rounded-lg bg-cover bg-center"
                      style={{ backgroundImage: `url(${classImageUrl})` }}
                    ></div>
                    <div>
                      <div className="font-semibold">
                        {specialization.class.name}
                      </div>
                      <div
                        className="badge badge-sm text-white"
                        style={{
                          backgroundColor: specialization.class.colorCode,
                        }}
                      >
                        {specialization.class.slug}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
