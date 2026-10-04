import type { ArticleBlock } from "@/types/content";

/** Renders structured article content. Text is rendered as text — never as HTML. */
export function ArticleBody({ blocks }: { blocks: ArticleBlock[] }) {
  return (
    <div className="prose-article">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return <h2 key={index}>{block.text}</h2>;
          case "subheading":
            return <h3 key={index}>{block.text}</h3>;
          case "list":
            return (
              <ul key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            );
          case "quote":
            return (
              <blockquote key={index}>
                <p>{block.text}</p>
              </blockquote>
            );
          default:
            return <p key={index}>{block.text}</p>;
        }
      })}
    </div>
  );
}

export function articlePlainText(blocks: ArticleBlock[]): string {
  return blocks.map((block) => (block.type === "list" ? block.items.join(" ") : block.text)).join(" ");
}
