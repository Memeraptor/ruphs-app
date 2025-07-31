"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Class from "@/services/Interfaces/Class";
import Specialization from "@/services/Interfaces/Specialization";
import Race from "@/services/Interfaces/Race";
import Faction from "@/services/Interfaces/Faction";

const CharacterForm = () => {
  const router = useRouter();
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    level: 1,
    gender: "",
    factionId: "",
    raceId: "",
    classId: "",
    specializationId: "",
    note: "",
  });

  // Dropdown data state
  const [factions, setFactions] = useState([]);
  const [races, setRaces] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allSpecializations, setAllSpecializations] = useState([]);
  const [specializations, setSpecializations] = useState([]);

  // Loading states
  const [loading, setLoading] = useState({
    factions: false,
    races: false,
    classes: false,
    specializations: false,
    submit: false,
  });

  // Error state
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load factions and all specializations on component mount
  useEffect(() => {
    loadFactions();
    loadAllSpecializations();
  }, []);

  // Load races when faction changes
  useEffect(() => {
    if (formData.factionId) {
      loadRaces(formData.factionId);
    } else {
      setRaces([]);
      setFormData((prev) => ({
        ...prev,
        raceId: "",
        classId: "",
        specializationId: "",
      }));
    }
  }, [formData.factionId]);

  // Load classes when race changes
  useEffect(() => {
    if (formData.raceId) {
      loadClasses(formData.raceId);
    } else {
      setClasses([]);
      setFormData((prev) => ({ ...prev, classId: "", specializationId: "" }));
    }
  }, [formData.raceId]);

  // Filter specializations when class changes
  useEffect(() => {
    if (formData.classId && allSpecializations.length > 0) {
      const filteredSpecs = allSpecializations.filter(
        (spec: Specialization) => spec.classId === parseInt(formData.classId)
      );
      setSpecializations(filteredSpecs);
    } else {
      setSpecializations([]);
      setFormData((prev) => ({ ...prev, specializationId: "" }));
    }
  }, [formData.classId, allSpecializations]);

  // API call functions
  const loadFactions = async () => {
    setLoading((prev) => ({ ...prev, factions: true }));
    try {
      const response = await fetch("/api/factions");
      if (!response.ok) throw new Error("Failed to load factions");
      const data = await response.json();
      setFactions(data);
    } catch (err) {
      setError("Failed to load factions");
    } finally {
      setLoading((prev) => ({ ...prev, factions: false }));
    }
  };

  const loadRaces = async (factionId: number) => {
    setLoading((prev) => ({ ...prev, races: true }));
    try {
      const response = await fetch(`/api/races?factionId=${factionId}`);
      if (!response.ok) throw new Error("Failed to load races");
      const data = await response.json();
      setRaces(data);
    } catch (err) {
      setError("Failed to load races");
    } finally {
      setLoading((prev) => ({ ...prev, races: false }));
    }
  };

  const loadClasses = async (raceId: number) => {
    setLoading((prev) => ({ ...prev, classes: true }));
    try {
      // First, get all classes
      const classesResponse = await fetch("/api/classes");
      if (!classesResponse.ok) throw new Error("Failed to load classes list");
      const allClasses = await classesResponse.json();

      // Then, get race-class combinations for this race
      const raceClassResponse = await fetch(
        `/api/race-classes?raceId=${raceId}`
      );
      if (!raceClassResponse.ok)
        throw new Error("Failed to load race-class combinations");
      const raceClassCombinations = await raceClassResponse.json();

      // Extract the classIds from race-class combinations
      const availableClassIds = raceClassCombinations.map(
        (combination) =>
          combination.classId || combination.class_id || combination.id
      );

      // Filter the full classes list to only include available classes
      const availableClasses = allClasses.filter((cls: Class) =>
        availableClassIds.includes(cls.id)
      );

      setClasses(availableClasses);
    } catch (err) {
      setError(`Failed to load classes: ${err.message}`);
    } finally {
      setLoading((prev) => ({ ...prev, classes: false }));
    }
  };

  const loadAllSpecializations = async () => {
    try {
      const response = await fetch("/api/specializations");
      if (!response.ok) throw new Error("Failed to load specializations");
      const data = await response.json();
      setAllSpecializations(data);
    } catch (err) {
      setError("Failed to load specializations");
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validation
    if (!formData.name.trim()) {
      setError("Character name is required");
      return;
    }
    if (!formData.gender) {
      setError("Gender is required");
      return;
    }
    if (!formData.specializationId) {
      setError("Please complete all selections");
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      const response = await fetch("/api/characters", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          level: parseInt(formData.level),
          gender: formData.gender,
          raceId: parseInt(formData.raceId),
          specializationId: parseInt(formData.specializationId),
          note: formData.note.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create character");
      }

      setSuccess("Character created successfully!");

      // Navigate to main page after successful creation
      setTimeout(() => {
        router.push("/");
      }, 1500);
      // Reset form
      setFormData({
        name: "",
        level: 1,
        gender: "",
        factionId: "",
        raceId: "",
        classId: "",
        specializationId: "",
        note: "",
      });
    } catch (err) {
      setError(err.message || "Failed to create character");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl mb-6">Create New Character</h2>

          {error && (
            <div className="alert alert-error mb-4">
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

          {success && (
            <div className="alert alert-success mb-4">
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

          <div className="space-y-4">
            {/* Character Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Character Name *</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter character name"
                className="input input-bordered w-full"
                required
              />
            </div>

            {/* Level */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Level</span>
              </label>
              <input
                type="number"
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                min="1"
                max="100"
                className="input input-bordered w-full"
              />
            </div>

            {/* Gender */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Gender *</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="select select-bordered w-full"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            {/* Faction */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Faction *</span>
              </label>
              <select
                name="factionId"
                value={formData.factionId}
                onChange={handleInputChange}
                className="select select-bordered w-full"
                disabled={loading.factions}
                required
              >
                <option value="">
                  {loading.factions ? "Loading factions..." : "Select Faction"}
                </option>
                {factions.map((faction: Faction) => (
                  <option key={faction.id} value={faction.id}>
                    {faction.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Race */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Race *</span>
              </label>
              <select
                name="raceId"
                value={formData.raceId}
                onChange={handleInputChange}
                className="select select-bordered w-full"
                disabled={!formData.factionId || loading.races}
                required
              >
                <option value="">
                  {!formData.factionId
                    ? "Select faction first"
                    : loading.races
                    ? "Loading races..."
                    : "Select Race"}
                </option>
                {races.map((race: Race) => (
                  <option key={race.id} value={race.id}>
                    {race.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Class *</span>
              </label>
              <select
                name="classId"
                value={formData.classId}
                onChange={handleInputChange}
                className="select select-bordered w-full"
                disabled={!formData.raceId || loading.classes}
                required
              >
                <option value="">
                  {!formData.raceId
                    ? "Select race first"
                    : loading.classes
                    ? "Loading classes..."
                    : "Select Class"}
                </option>
                {classes.map((cls: Class) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Specialization */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Specialization *</span>
              </label>
              <select
                name="specializationId"
                value={formData.specializationId}
                onChange={handleInputChange}
                className="select select-bordered w-full"
                disabled={!formData.classId || loading.specializations}
                required
              >
                <option value="">
                  {!formData.classId
                    ? "Select class first"
                    : loading.specializations
                    ? "Loading specializations..."
                    : "Select Specialization"}
                </option>
                {specializations.map((spec: Specialization) => (
                  <option key={spec.id} value={spec.id}>
                    {spec.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Note */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Notes</span>
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                placeholder="Optional character notes..."
                className="textarea textarea-bordered h-24"
              />
            </div>

            {/* Submit Button */}
            <div className="form-control mt-6">
              <button
                onClick={handleSubmit}
                className={`btn btn-primary ${loading.submit ? "loading" : ""}`}
                disabled={loading.submit}
              >
                {loading.submit ? "Creating Character..." : "Create Character"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterForm;
