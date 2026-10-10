const TRAITS = ["Coat", "Size", "Energy", "Shedding"];
const BREEDS = {
  LAB: ["Short", "Large", "High", "High"],
  PDL: ["Curly", "Medium", "High", "Low"],
};
const PETS = [
  ["P101", "LAB", "$2,400"],
  ["P102", "LAB", "$2,400"],
  ["P103", "PDL", "$3,100"],
  ["P104", "LAB", "$2,200"],
];

/**
 * The model's main 3NF move. Traits belong to the breed, not the dog
 * (assumption AS.1), so PetID → Breed → Coat… is a transitive dependency.
 * Kept in PET, every Labrador repeats the same four values; split out, each
 * breed's traits are stored once. Rows are illustrative.
 */
export function BreedNormalisation() {
  return (
    <figure className="cs-figure bn" data-reveal>
      <div className="bn-grid">
        <div className="bn-side">
          <p className="al-mono bn-label bn-bad">Before: traits stored per pet</p>
          <table>
            <thead>
              <tr>
                <th>PetID</th>
                <th>Breed</th>
                {TRAITS.map((t) => (
                  <th key={t}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PETS.map(([id, b]) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{b}</td>
                  {BREEDS[b].map((v, i) => (
                    <td key={i} className={b === "LAB" ? "bn-dup" : undefined}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="bn-note">Change a Labrador&rsquo;s energy level and you must find every Labrador row, or the table contradicts itself.</p>
        </div>
        <div className="bn-side">
          <p className="al-mono bn-label bn-good">After: PET → BREEDS</p>
          <table>
            <thead>
              <tr>
                <th>PetID</th>
                <th>Breed (FK)</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {PETS.map(([id, b, price]) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td className="bn-fk">{b}</td>
                  <td>{price}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th>Identifier</th>
                {TRAITS.map((t) => (
                  <th key={t}>{t}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(BREEDS).map(([b, vals]) => (
                <tr key={b}>
                  <td className="bn-fk">{b}</td>
                  {vals.map((v, i) => (
                    <td key={i}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="bn-note">Each breed&rsquo;s traits live in one row; a pet just points at its breed.</p>
        </div>
      </div>
      <figcaption className="cs-figcaption">
        <span>
          The transitive dependency PetID → BreedIdentifier → Coat, Size, Energy… removed by the BREEDS relation (FD8), which holds because of assumption AS.1: all dogs of a breed have the same qualities. Rows are illustrative; the model has seven traits.
        </span>
        <span className="al-mono">3NF</span>
      </figcaption>
    </figure>
  );
}
