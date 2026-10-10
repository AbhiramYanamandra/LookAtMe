import Image from "next/image";

/**
 * Hero-tile stand-in for the honours thesis: the same photo, grainy on the
 * left and clean on the right, as in the interactive figure. Decorative.
 */
export function ThesisGlyph() {
  return (
    <div className="al-glyph" aria-hidden="true">
      <div className="al-glyph-photo">
        <Image src="/images/thesis-test.jpg" alt="" width={512} height={384} sizes="240px" />
        <span className="al-glyph-grain" />
      </div>
      <div className="al-glyph-foot">
        <span>NOISY → CORRECTED</span>
        <span>−95.5%</span>
      </div>
    </div>
  );
}
