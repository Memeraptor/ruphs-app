import Class from "@/services/Interfaces/Class";

interface ClassBadgeProps {
  cls: Class;
  onDelete: () => void;
  isDeleting: boolean;
}

export default function ClassBadge({
  cls,
  onDelete,
  isDeleting,
}: ClassBadgeProps) {
  return (
    <div
      className="badge badge-lg gap-2 p-3 bg-base-100 border-2"
      style={{
        color: cls.colorCode,
        borderColor: cls.colorCode,
        backgroundColor: "var(--b1)",
      }}
    >
      <span>{cls.name}</span>
      <button
        className="btn btn-ghost btn-xs hover:text-error"
        style={{ color: cls.colorCode }}
        onClick={onDelete}
        disabled={isDeleting}
        title="Remove this class from race"
      >
        {isDeleting ? (
          <span className="loading loading-spinner loading-xs"></span>
        ) : (
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
        )}
      </button>
    </div>
  );
}
