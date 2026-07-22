'use client';
import { useState, FormEvent } from 'react';
import { apiRequest } from '@/lib/apiClient';
import { RateQuote, ShipmentItem } from '@/types';

const emptyItem = (): ShipmentItem => ({
  sku: '', quantity: 1, weightKg: 1,
  lengthCm: 10, widthCm: 10, heightCm: 10,
});

const SAMPLE_PINCODES = [
  { code: '110001', label: 'Delhi (North)' },
  { code: '400001', label: 'Mumbai (West)' },
  { code: '600001', label: 'Chennai (South)' },
  { code: '700001', label: 'Kolkata (East)' },
  { code: '560001', label: 'Bangalore (South)' },
  { code: '500001', label: 'Hyderabad (South)' },
];

export default function RateQuotePage() {
  const [origin, setOrigin] = useState('110001');
  const [destination, setDestination] = useState('400001');
  const [items, setItems] = useState<ShipmentItem[]>([emptyItem()]);
  const [quote, setQuote] = useState<RateQuote | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateItem = (i: number, field: keyof ShipmentItem, val: string | number) =>
    setItems(ls => ls.map((item, idx) => idx === i ? { ...item, [field]: val } : item));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setQuote(null); setLoading(true);
    try {
      const result = await apiRequest<RateQuote>('/api/rate-quote', {
        method: 'POST',
        body: JSON.stringify({ originPincode: origin, destinationPincode: destination, items }),
      });
      setQuote(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to get quote');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-1">Rate & Routing Calculator</h2>
      <p className="text-slate-500 text-sm mb-6">
        Computes delivery cost using volumetric weight and optimal vehicle assignment.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 flex flex-col gap-5">

        {/* Route */}
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Origin Pincode
            <select className="input" value={origin} onChange={e => setOrigin(e.target.value)}>
              {SAMPLE_PINCODES.map(p => <option key={p.code} value={p.code}>{p.code} — {p.label}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-slate-600">
            Destination Pincode
            <select className="input" value={destination} onChange={e => setDestination(e.target.value)}>
              {SAMPLE_PINCODES.map(p => <option key={p.code} value={p.code}>{p.code} — {p.label}</option>)}
            </select>
          </label>
        </div>

        {/* Items */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-700">Shipment Items</span>
            <button type="button" onClick={() => setItems(i => [...i, emptyItem()])} className="btn-secondary text-xs">
              + Add Item
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  {['SKU', 'Qty', 'Weight (kg)', 'L (cm)', 'W (cm)', 'H (cm)', ''].map(h => (
                    <th key={h} className="px-3 py-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {(['sku', 'quantity', 'weightKg', 'lengthCm', 'widthCm', 'heightCm'] as const).map(field => (
                      <td key={field} className="px-2 py-1">
                        <input
                          className="input text-xs"
                          type={field === 'sku' ? 'text' : 'number'}
                          min={field === 'sku' ? undefined : 0.1}
                          step={field === 'sku' ? undefined : 0.1}
                          value={item[field]}
                          onChange={e => updateItem(i, field, field === 'sku' ? e.target.value : Number(e.target.value))}
                          required
                        />
                      </td>
                    ))}
                    <td className="px-2 py-1">
                      {items.length > 1 && (
                        <button type="button" onClick={() => setItems(ls => ls.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-600">✕</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}

        <button type="submit" className="btn-primary self-start" disabled={loading}>
          {loading ? 'Calculating...' : 'Get Rate Quote'}
        </button>
      </form>

      {/* Result */}
      {quote && (
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Quote Result</h3>
            <span className="text-2xl font-bold text-emerald-600">₹{quote.totalCost.toLocaleString()}</span>
          </div>

          {/* Route info */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-slate-400 text-xs uppercase mb-1">Route</div>
              <div className="font-medium">{quote.originZone} → {quote.destinationZone}</div>
              <div className="text-slate-500 text-xs">{quote.originPincode} → {quote.destinationPincode}</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-slate-400 text-xs uppercase mb-1">Rate</div>
              <div className="font-medium">₹{quote.ratePerKg}/kg</div>
            </div>
            <div className="bg-slate-50 rounded-lg p-3">
              <div className="text-slate-400 text-xs uppercase mb-1">Vehicles</div>
              <div className="font-medium">{quote.vehicles.length} vehicle(s)</div>
            </div>
          </div>

          {/* Vehicle breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Vehicle Breakdown</h4>
            <div className="flex flex-col gap-2">
              {quote.vehicles.map((v, i) => (
                <div key={i} className="border border-slate-100 rounded-lg p-3 text-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">🚚 {v.vehicleType} <span className="text-slate-400 text-xs">(cap: {v.capacityKg}kg)</span></span>
                    <span className="font-semibold text-slate-700">₹{v.cost.toLocaleString()}</span>
                  </div>
                  <div className="text-slate-500 text-xs">
                    Chargeable: {v.totalChargeableKg}kg ·{' '}
                    {[...new Set(v.items.map(it => it.sku))].join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Justification */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <div className="text-xs font-semibold text-blue-700 uppercase mb-1">How this was chosen</div>
            <p className="text-sm text-blue-800">{quote.justification}</p>
          </div>
        </div>
      )}
    </div>
  );
}
