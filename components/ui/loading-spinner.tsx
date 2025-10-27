"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center h-10">
      <div className="w-10 h-10 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}
