const seed = 5678; let s = seed;
const rnd = () => (s = (s*16807)%2147483647) / 2147483647;
const randInt = (a,b) => Math.floor(rnd()*(b-a+1))+a;
const pick = (arr) => arr[randInt(0, arr.length-1)];

export const sites = [
  { code:'AR', name:'Atlas Road', status:'Active' },
  { code:'VRCB', name:'VRCB', status:'Active' },
  { code:'WR', name:'West Ruislip', status:'Active' },
  { code:'FI', name:'Flat Iron', status:'Inactive' },
  { code:'AY', name:'Atlas Yard', status:'Active' },
  { code:'DS', name:'Depot South', status:'Active' },
];

const roles = ['Admin','Manager','Supervisor','Fitter','Viewer'];

export const users = Array.from({ length: 30 }, (_, i) => {
  const role = pick(roles);
  const siteCount = randInt(1,3);
  const assigned = Array.from(new Set(Array.from({length:siteCount}, ()=> pick(sites).code)));
  return {
    id: `U-${100+i}`,
    name: `User ${i+1}`,
    email: `user${i+1}@example.com`,
    role,
    sites: assigned,
    status: pick(['Active','Disabled']),
    lastLogin: `2025-10-${String(randInt(1,28)).padStart(2,'0')}`,
  };
});

export const teams = sites.map((s, i) => ({
  siteCode: s.code,
  siteName: s.name,
  teamCount: randInt(1,4),
  managers: randInt(1,3),
  status: s.status,
}));

export const auditLog = Array.from({ length: 50 }, (_, i) => ({
  id: `AUD-${1000+i}`,
  time: `2025-10-${String(randInt(1,28)).padStart(2,'0')} 0${randInt(0,9)}:${String(randInt(0,59)).padStart(2,'0')}`,
  user: pick(users).email,
  action: pick(['LOGIN','ROLE_CHANGE','SITE_ASSIGN','INVITE_SENT','SETTINGS_UPDATE']),
  target: pick(['User','Site','Role','Settings']),
  details: 'Mock entry',
  ip: `192.168.1.${randInt(2,254)}`,
}));




