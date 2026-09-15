import Image from "next/image";
import { evaluate } from "@mdx-js/mdx";
import remarkGfm from "remark-gfm";
import * as jsxRuntime from "react/jsx-runtime";
import * as jsxDevRuntime from "react/jsx-dev-runtime";
import { imageSize } from "image-size";
import fs from "node:fs";
import path from "node:path";
import { PUBLIC_DIR } from "@/lib/projects";

const KIND_LABEL = {
  screenshot: "Screenshot",
  photo: "Photograph",
  render: "Render",
  diagram: "Diagram",
  illustration: "Illustration",
};

export function kindLabel(kind) {
  return kind ? (KIND_LABEL[kind] ?? kind) : null;
}

function sizeOf(src) {
  const file = path.join(PUBLIC_DIR, src);
  if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file)) {
    throw new Error(`Case-study image "${src}" does not exist under public/`);
  }
  return imageSize(fs.readFileSync(file));
}

/**
 * <Figure src alt caption kind /> — an evidence image with an honest label
 * (screenshot, render, diagram, …) so illustrations are never mistaken for
 * implementation evidence.
 */
export function Figure({ src, alt, caption, kind, width, height }) {
  const size = width && height ? { width, height } : sizeOf(src);
  return (
    <figure className="cs-figure" data-reveal>
      <div className="cs-figure-frame">
        <Image src={src} alt={alt} width={size.width} height={size.height} sizes="(max-width: 900px) 100vw, 680px" />
      </div>
      {(caption || kind) && (
        <figcaption className="cs-figcaption">
          <span>{caption}</span>
          {kind && <span className="al-mono">{kindLabel(kind)}</span>}
        </figcaption>
      )}
    </figure>
  );
}

/** <Note>…</Note> — a restrained callout for caveats and open items. */
export function Note({ children }) {
  return <aside className="cs-note">{children}</aside>;
}

/** <Gallery>{figures}</Gallery> — a responsive grid of <Figure>s. */
export function Gallery({ children }) {
  return <div className="cs-gallery">{children}</div>;
}

// Headings, images, and diagrams reveal on scroll; paragraphs stay readable.
const components = {
  Figure,
  Note,
  Gallery,
  h2: (props) => <h2 data-reveal {...props} />,
  h3: (props) => <h3 data-reveal {...props} />,
};

const development = process.env.NODE_ENV !== "production";

/**
 * Compile and render a project's MDX body on the server. Frontmatter has
 * already been stripped by the loader, so only the body is compiled.
 */
export async function CaseStudyBody({ source }) {
  const { default: Content } = await evaluate(source, {
    ...(development ? jsxDevRuntime : jsxRuntime),
    development,
    remarkPlugins: [remarkGfm],
  });
  return (
    <div className="cs-body">
      <Content components={components} />
    </div>
  );
}
