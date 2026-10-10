/**
 * Library card for PETspot: six of the model's real entities, drawn as small
 * tables that fade in while their relationships draw between them. The bottom
 * row is the seller side the team built in PostgreSQL (Part D), tagged SQL.
 */
const TABLES = [
  { name: "buyer", x: 6, y: 14, rows: 3 },
  { name: "pet_enquiry", x: 88, y: 14, rows: 1 },
  { name: "pet", x: 170, y: 14, rows: 3 },
  { name: "service", x: 6, y: 90, rows: 3, built: true },
  { name: "svc_enquiry", x: 88, y: 90, rows: 1, built: true },
  { name: "seller", x: 170, y: 90, rows: 3, built: true },
];

const LINKS = [
  "M70 31 C 79 31, 79 28, 88 28", // buyer → pet_enquiry
  "M152 28 C 161 28, 161 31, 170 31", // pet_enquiry → pet
  "M202 90 L 202 58", // seller → pet
  "M70 112 C 79 112, 79 104, 88 104", // service → svc_enquiry
  "M152 104 C 161 104, 161 112, 170 112", // svc_enquiry → seller
];

export function ErdCard() {
  return (
    <svg viewBox="0 0 240 150" className="pv pv-schema">
      {LINKS.map((d, i) => (
        <path key={d} className="pv-link" d={d} style={{ "--i": i }} />
      ))}
      {TABLES.map((t, i) => (
        <g key={t.name} transform={`translate(${t.x} ${t.y})`} className="pv-table" style={{ "--i": i }}>
          <rect width="64" height={t.rows === 1 ? 28 : 44} rx="4" />
          <rect className="pv-head" width="64" height="12" rx="4" />
          <text x="6" y="9">
            {t.name}
          </text>
          {t.built && (
            <text className="pv-sql" x="64" y="-2.5" textAnchor="end">
              SQL
            </text>
          )}
          {Array.from({ length: t.rows }, (_, row) => (
            <rect key={row} className="pv-row" x="6" y={18 + row * 8} width={36 - row * 6} height="3" rx="1.5" />
          ))}
        </g>
      ))}
    </svg>
  );
}
