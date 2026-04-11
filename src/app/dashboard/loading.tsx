export default function DashboardLoading() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl p-5 border border-gray-100 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-8 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl p-6 border border-gray-100 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-5 bg-gray-100 rounded w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
