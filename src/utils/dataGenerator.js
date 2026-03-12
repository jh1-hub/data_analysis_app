export function generateCorrelatedData(n, r) {
  const data = [];
  for (let i = 0; i < n; i++) {
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    let z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    let z2 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
    
    let x = z1;
    let y = r * z1 + Math.sqrt(1 - r * r) * z2;
    
    x = x * 15 + 50;
    y = y * 15 + 50;
    
    data.push({ x: Math.round(x), y: Math.round(y) });
  }
  return data;
}
