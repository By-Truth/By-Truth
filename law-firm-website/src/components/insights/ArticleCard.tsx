import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/types/content";
import { cn, formatDate } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

interface ArticleCardProps {
  article: Article;
  variant?: "default" | "feature";
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}

export function ArticleCard({ article, variant = "default", headingLevel: Heading = "h3", priority }: ArticleCardProps) {
  const href = `/insights/${article.slug}`;
  const feature = variant === "feature";

  return (
    <article className={cn("group grid h-full", feature ? "gap-8 lg:grid-cols-12 lg:items-center lg:gap-14" : "content-start gap-6")}>
      <Link href={href} tabIndex={-1} aria-hidden="true" className={cn("relative block overflow-hidden bg-navy-800", feature ? "aspect-[16/10] lg:col-span-7" : "aspect-[3/2]")}>
        <Image
          src={article.image.src}
          alt=""
          fill
          priority={priority}
          sizes={feature ? "(min-width: 1024px) 55vw, 100vw" : "(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"}
          className="object-cover transition-transform duration-700 ease-[var(--ease-elegant)] group-hover:scale-[1.03]"
        />
      </Link>
      <div className={cn(feature && "lg:col-span-5")}>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.7rem] font-semibold tracking-[0.18em] uppercase">
          <span className="text-gold-deep">{article.category}</span>
          <span aria-hidden="true" className="h-px w-5 bg-line" />
          <time dateTime={article.publishedAt} className="text-slate">
            {formatDate(article.publishedAt)}
          </time>
        </div>
        <Heading className={cn("mt-4 font-serif leading-tight text-navy", feature ? "text-3xl sm:text-4xl" : "text-2xl")}>
          <Link href={href} className="link-underline">
            {article.title}
          </Link>
        </Heading>
        <p className={cn("mt-4 leading-relaxed text-slate", feature ? "text-base sm:text-lg" : "text-[0.95rem]")}>{article.excerpt}</p>
        <Link
          href={href}
          className="mt-6 inline-flex items-center gap-2 text-xs font-semibold tracking-[0.16em] text-navy uppercase transition-colors hover:text-gold-deep"
        >
          Read Article
          <span className="sr-only">: {article.title}</span>
          <Icon name="arrow-right" size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  );
}
