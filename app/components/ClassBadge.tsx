import Class from "@/services/Interfaces/Class";
import Race from "@/services/Interfaces/Race";
import React from "react";

interface Props {
  propClass: Class;
  race: Race;
  handleDelete: (raceId: number, classId: number) => void;
}

const ClassBadge = ({ propClass, race, handleDelete }: Props) => {
  return (
    <div
      className="badge badge-lg gap-2 p-3 bg-base-100 border-2"
      style={{
        color: propClass.colorCode,
        borderColor: propClass.colorCode,
        backgroundColor: "var(--b1)",
      }}
    >
      <span>{propClass.name}</span>
      <button
        className="btn btn-ghost btn-xs hover:text-error"
        style={{ color: propClass.colorCode }}
        onClick={() => handleDelete(race.id, propClass.id)}
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
  );
};

export default ClassBadge;
