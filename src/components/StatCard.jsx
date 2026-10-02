// src/components/StatCard.jsx
export default function StatCard({ title, value, subtitle, trend, isPositive }) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 flex flex-col">
      <span className="text-slate-400 text-sm font-medium mb-1">{title}</span>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-white">{value}</span>
        
        {trend && (
          <span className={`text-sm font-semibold px-2 py-1 rounded-md ${
            isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
      {subtitle && <span className="text-slate-500 text-xs mt-2">{subtitle}</span>}
    </div>
  );
}