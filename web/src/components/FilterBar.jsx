import { useMemo } from 'react';

export default function FilterBar({ suppliers = [], categories = [], sites = [], zonesBySite = {}, landmarksBySite = {}, value = {}, onChange, showSku = true, onExport }) {
	const zones = useMemo(() => zonesBySite[value.site] || [], [zonesBySite, value.site]);
	const landmarks = useMemo(() => landmarksBySite[value.site] || [], [landmarksBySite, value.site]);
	function update(patch) { onChange?.({ ...value, ...patch }); }
	function clear() { onChange?.({}); }
	return (
		<div className="card p-2 flex flex-col gap-2">
			<div className="grid grid-cols-12 gap-x-2 gap-y-2">
				<select className="input col-span-12 md:col-span-2" value={value.supplier || ''} onChange={(e)=>update({ supplier: e.target.value || undefined })}>
					<option value="">Supplier</option>
					{suppliers.map(s => <option key={s} value={s}>{s}</option>)}
				</select>
				<select className="input col-span-12 md:col-span-2" value={value.category || ''} onChange={(e)=>update({ category: e.target.value || undefined })}>
					<option value="">Category</option>
					{categories.map(s => <option key={s} value={s}>{s}</option>)}
				</select>
				<select className="input col-span-12 md:col-span-2" value={value.site || ''} onChange={(e)=>update({ site: e.target.value || undefined, zone: undefined, landmark: undefined })}>
					<option value="">Site</option>
					{sites.map(s => <option key={s} value={s}>{s}</option>)}
				</select>
				<select className="input col-span-12 md:col-span-2" value={value.zone || ''} onChange={(e)=>update({ zone: e.target.value || undefined })} disabled={!value.site}>
					<option value="">Zone</option>
					{zones.map(z => <option key={z} value={z}>{z}</option>)}
				</select>
				<select className="input col-span-12 md:col-span-2" value={value.landmark || ''} onChange={(e)=>update({ landmark: e.target.value || undefined })} disabled={!value.site}>
					<option value="">Landmark</option>
					{landmarks.map(l => <option key={l} value={l}>{l}</option>)}
				</select>
				{showSku && (
					<input className="input col-span-12 md:col-span-2" placeholder="SKU / Article…" value={value.sku || ''} onChange={(e)=>update({ sku: e.target.value })} />
				)}
			</div>
			<div className="flex gap-2 justify-end">
				<button className="btn" onClick={clear}>Clear</button>
				{onExport && <button className="btn" onClick={onExport}>Export CSV</button>}
			</div>
		</div>
	);
}
