import React from "react";
import Race from "@/services/Interfaces/Race";
import Faction from "@/services/Interfaces/Faction";
import RacePortrait from "./RacePortrait";

interface RaceClassCardProps {
  race: Race;
  classCount: number;
  children: React.ReactNode;
}

const getFactionBadgeColor = (faction?: Faction): string => {
  if (!faction) return "badge-secondary";
  return faction.id === 1
    ? "badge-info"
    : faction.id === 2
    ? "badge-error"
    : "badge-secondary";
};

export default function RaceClassCard({
  race,
  classCount,
  children,
}: RaceClassCardProps) {
  return (
    <div className="card bg-base-100 shadow-md border border-base-300">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Race Portrait */}
            <RacePortrait race={race} />

            <h2 className="card-title text-xl text-base-content">
              {race.name}
            </h2>
            {race.faction && (
              <div className={`badge ${getFactionBadgeColor(race.faction)}`}>
                {race.faction.name}
              </div>
            )}
          </div>
          <div className="badge badge-outline">
            {classCount} {classCount === 1 ? "class" : "classes"}
          </div>
        </div>

        <div className="divider my-2"></div>

        <div className="flex flex-wrap gap-2">{children}</div>

        {classCount === 0 && (
          <div className="text-center py-4">
            <span className="text-base-content/50">
              No classes associated with this race
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
