import Link from "next/link";
import { classMap } from "../../services/imageMaps/classIconMap";
import { specMap } from "@/services/imageMaps/specializationIconMap";
import Class from "@/services/Interfaces/Class";
import Specialization from "@/services/Interfaces/Specialization";

interface ClassSpecializationsCardProps {
  className: string;
  classData: Class;
  specializations: Specialization[];
}

export default function ClassSpecializationsCard({
  className,
  classData,
  specializations,
}: ClassSpecializationsCardProps) {
  return (
    <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      {/* Class Background Image */}
      <div
        className="h-48 bg-gradient-to-br from-base-300 to-base-200 relative overflow-hidden"
        style={{
          backgroundImage: classMap[classData.slug]
            ? `url(${classMap[classData.slug]})`
            : "none",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
          style={{
            background: classData.colorCode
              ? `linear-gradient(to top, ${classData.colorCode}88, transparent)`
              : "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
          }}
        />

        {/* Class Icon */}
        <div className="absolute top-4 left-4">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center text-gray-800 font-bold text-xl shadow-lg"
            style={{
              backgroundColor: classData.colorCode || "#6B7280",
            }}
          >
            {className.charAt(0).toUpperCase()}
          </div>
        </div>

        {/* Armor Type Badge */}
        {classData.armorType && (
          <div className="absolute top-4 right-4">
            <div className="badge badge-ghost bg-black/20 text-white border-none">
              {classData.armorType}
            </div>
          </div>
        )}

        {/* Class Title */}
        <div className="absolute bottom-4 left-4">
          <h2 className="text-2xl font-bold text-white">{className}</h2>
          <p className="text-white/80 text-sm">
            {specializations.length} specialization
            {specializations.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Specializations List */}
      <div className="card-body p-4">
        <div className="flex flex-wrap justify-evenly gap-1">
          {specializations.map((specialization) => (
            <div
              key={specialization.id}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-base-200 hover:bg-base-300 transition-colors duration-200 flex-shrink-0"
            >
              {/* <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: classData.colorCode || "#6B7280",
                }}
              /> */}
              <img
                src={specMap[specialization.slug]}
                className="w-6 h-6 rounded-full"
              />
              <Link href={`/specializations/${specialization.id}`}>
                <h3 className="font-semibold text-sm text-base-content">
                  {specialization.name}
                </h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
