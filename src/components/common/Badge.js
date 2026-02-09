// src/components/common/Badge.jsx
export default function Badge({ show }) {
  if (!show) return null;
  return <span className="inline-block ml-1 w-2 h-2 bg-red-600 rounded-full" />;
}
