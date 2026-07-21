const map = {
  fulfilled: 'bg-green-100 text-green-700',
  backordered: 'bg-red-100 text-red-600',
  partial: 'bg-yellow-100 text-yellow-700',
  'In Stock': 'bg-green-100 text-green-700',
  'Low Stock': 'bg-yellow-100 text-yellow-700',
  'Out of Stock': 'bg-red-100 text-red-600',
};

export default function Badge({ label }: { label: keyof typeof map }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${map[label]}`}>
      {label}
    </span>
  );
}
