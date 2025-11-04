export const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = (arr) => arr[rand(0, arr.length - 1)];
export const dateWithin = (days) => new Date(Date.now() - rand(0, days) * 86400000).toISOString().slice(0, 10);

const siteSeeds = [
  { code: 'AR', name: 'Atlas Road' },
  { code: 'VRCB', name: 'VRCB' },
  { code: 'WR', name: 'West Ruislip' },
  { code: 'FI', name: 'Flat Iron' },
  { code: 'AY', name: 'Atlas Yard' },
  { code: 'DS', name: 'Depot South' },
];
const managers = ['Gethin Price','Cyril Martins','Ross King','Eddie Shaw','Nina Hart','Tom Patel'];
const zoneTypes = ['Warehouse','Yard','Mezzanine','Cage','Cold Store'];
const categories = ['Hydraulics','Electrical','Clamps','Fasteners','Filters','PPE'];

export const sites = Array.from({ length: 20 }, (_, i) => {
  const seed = siteSeeds[i % siteSeeds.length];
  return {
    code: seed.code + (i >= siteSeeds.length ? '-' + (i + 1) : ''),
    name: seed.name,
    area: pick(['Old Oak Common','Euston','Acton','Paddington','Soho','Stratford']),
    manager: pick(managers),
    phone: `+44 20 7${rand(100,999)} ${rand(100,999)}${rand(0,9)}${rand(0,9)}`,
    status: pick(['Active','Inactive','Planned']),
    timezone: 'Europe/London',
    created: dateWithin(800),
  };
});

// Map for valid site refs
const siteByIdx = (i) => sites[i % sites.length];

export const zones = Array.from({ length: 20 }, (_, i) => {
  const site = siteByIdx(i);
  const zoneName = pick(['A-Bay','B-Bay','C-Bay','Mezz-1','Cage-1','Yard-2']);
  const capacityBins = rand(60, 200);
  const occupancyPct = rand(10, 95);
  return {
    zone: zoneName,
    siteCode: site.code,
    siteName: site.name,
    type: pick(zoneTypes),
    temp: rand(5, 25),
    humidity: rand(30, 70),
    capacityBins,
    occupancyPct,
    restrictions: rand(0,1) ? [pick(['Hazchem','PPE-only','No-Flammables'])] : [],
  };
});

const zoneByIdx = (i) => zones[i % zones.length];

export const bins = Array.from({ length: 20 }, (_, i) => {
  const zone = zoneByIdx(i);
  const row = rand(1, 10);
  const col = rand(1, 20);
  const bin = `${String.fromCharCode(64 + row)}${col}-${rand(1, 20)}`;
  const maxQty = rand(100, 300);
  const currentQty = rand(0, maxQty);
  const percentFull = Math.round((currentQty / maxQty) * 100);
  return {
    bin,
    zone: zone.zone,
    siteCode: zone.siteCode,
    siteName: zone.siteName,
    barcode: `${zone.siteCode}-${zone.zone}-${bin}`.replace(/\s+/g, '-').toUpperCase(),
    allowedCategory: pick(categories),
    maxQty,
    currentQty,
    percentFull,
    lastMove: dateWithin(90),
  };
});


