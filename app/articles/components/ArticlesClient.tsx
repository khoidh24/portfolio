"use client";

import {
  useCallback,
  useMemo,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import BlogItem from "./BlogItem";
import { ArticleData } from "../services/article.type";

const PAGE_SIZE = 6;
type SortOrder = "asc" | "desc";

type FilterState = {
  q: string;
  tags: string[];
  sort: SortOrder;
  page: number;
};

type Props = { articles: ArticleData[]; isEmpty?: boolean };

export default function ArticlesClient({ articles, isEmpty }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Optimistic local state — updates instantly on interaction
  const [optimistic, setOptimistic] = useState<FilterState>(() => ({
    q: searchParams.get("q") ?? "",
    tags: searchParams.getAll("tag"),
    sort: (searchParams.get("sort") ?? "asc") as SortOrder,
    page: Math.max(1, Number(searchParams.get("page") ?? "1")),
  }));

  // Sync optimistic state when URL actually updates (e.g. back/forward)
  useEffect(() => {
    setOptimistic({
      q: searchParams.get("q") ?? "",
      tags: searchParams.getAll("tag"),
      sort: (searchParams.get("sort") ?? "asc") as SortOrder,
      page: Math.max(1, Number(searchParams.get("page") ?? "1")),
    });
  }, [searchParams]);

  const push = useCallback(
    (next: Partial<FilterState>) => {
      const merged: FilterState = { ...optimistic, ...next };
      // Reset page unless explicitly changing page
      if (!("page" in next)) merged.page = 1;

      // Update UI immediately
      setOptimistic(merged);

      // Push URL in background transition
      const params = new URLSearchParams();
      if (merged.q) params.set("q", merged.q);
      merged.tags.forEach((t) => params.append("tag", t));
      if (merged.sort !== "asc") params.set("sort", merged.sort);
      if (merged.page > 1) params.set("page", String(merged.page));
      const qs = params.toString();
      startTransition(() => {
        router.push(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
      });
    },
    [optimistic, router, pathname],
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => a.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    let result = [...articles];
    if (optimistic.q.trim()) {
      const q = optimistic.q.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q));
    }
    if (optimistic.tags.length > 0) {
      result = result.filter((a) =>
        optimistic.tags.some((t) => a.tags?.includes(t)),
      );
    }
    result.sort((a, b) => {
      const cmp = a.title.localeCompare(b.title);
      return optimistic.sort === "asc" ? cmp : -cmp;
    });
    return result;
  }, [articles, optimistic.q, optimistic.tags, optimistic.sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(optimistic.page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleTag = useCallback(
    (tag: string) => {
      const next = optimistic.tags.includes(tag)
        ? optimistic.tags.filter((t) => t !== tag)
        : [...optimistic.tags, tag];
      push({ tags: next });
    },
    [optimistic.tags, push],
  );

  const isFiltered = optimistic.q.trim() || optimistic.tags.length > 0;
  const isLastPage = currentPage >= totalPages && filtered.length > 0;

  if (isEmpty) {
    return (
      <div className="border-foreground/10 flex flex-col items-start gap-4 border-t py-24">
        <p className="text-foreground/20 text-[10px] font-semibold tracking-[0.25em] uppercase">
          Nothing here yet
        </p>
        <p className="text-foreground/50 max-w-md text-sm leading-relaxed">
          This space is still warming up. I&apos;m writing, thinking, and
          brewing something worth reading — check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {/* Controls — always instant, no pending state */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <span className="text-foreground/30 pointer-events-none absolute top-1/2 left-4 -translate-y-1/2">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </span>
            <input
              type="text"
              value={optimistic.q}
              onChange={(e) => push({ q: e.target.value })}
              placeholder="Search articles..."
              className="border-foreground/15 bg-foreground/3 text-foreground placeholder:text-foreground/30 focus:border-foreground/40 w-full rounded-none border py-3 pr-4 pl-10 text-sm outline-none transition-colors duration-200"
            />
          </div>

          {/* Sort */}
          <div className="border-foreground/15 flex shrink-0 overflow-hidden border">
            <button
              onClick={() => push({ sort: "asc" })}
              className={`px-4 py-3 text-xs font-semibold tracking-widest uppercase transition-colors duration-200 ${
                optimistic.sort === "asc"
                  ? "bg-foreground text-background"
                  : "text-foreground/40 hover:text-foreground"
              }`}
            >
              A → Z
            </button>
            <div className="border-foreground/15 border-l" />
            <button
              onClick={() => push({ sort: "desc" })}
              className={`px-4 py-3 text-xs font-semibold tracking-widest uppercase transition-colors duration-200 ${
                optimistic.sort === "desc"
                  ? "bg-foreground text-background"
                  : "text-foreground/40 hover:text-foreground"
              }`}
            >
              Z → A
            </button>
          </div>
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => {
              const active = optimistic.tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => handleTag(tag)}
                  className={`border px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-200 ${
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground/15 text-foreground/40 hover:border-foreground/40 hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
            {optimistic.tags.length > 0 && (
              <button
                onClick={() => push({ tags: [] })}
                className="border-red-500/60 text-red-500/70 hover:border-red-500 hover:text-red-500 border px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-200"
              >
                Clear ×
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-foreground/30 flex items-center justify-between text-xs tracking-widest uppercase">
        <span>
          {filtered.length} article{filtered.length !== 1 ? "s" : ""}
          {optimistic.tags.length > 0 && ` · ${optimistic.tags.join(", ")}`}
          {optimistic.q && ` · "${optimistic.q}"`}
        </span>
        {totalPages > 1 && (
          <span>
            {currentPage} / {totalPages}
          </span>
        )}
      </div>

      {/* List — dims while URL transition is pending */}
      <div
        className={`flex flex-col transition-opacity duration-150 ${isPending ? "opacity-50" : "opacity-100"}`}
      >
        {paginated.length > 0 ? (
          <>
            {paginated.map((post, idx) => (
              <BlogItem
                key={post.slug}
                data={post}
                index={(currentPage - 1) * PAGE_SIZE + idx}
              />
            ))}
            <div className="border-foreground/10 border-t" />
            {isLastPage && (
              <p className="text-foreground/30 py-10 text-center text-xs tracking-widest uppercase">
                {isFiltered
                  ? "That's all that matches — try broadening your search."
                  : "That's everything for now — more on the way. Stay tuned."}
              </p>
            )}
          </>
        ) : (
          <div className="border-foreground/10 flex flex-col items-start gap-3 border-t py-20">
            <p className="text-foreground/20 text-[10px] font-semibold tracking-[0.25em] uppercase">
              No matches
            </p>
            <p className="text-foreground/40 text-sm">
              Nothing fits that filter combo. Try loosening the search or
              swapping a tag.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => push({ page: currentPage - 1 })}
            disabled={currentPage === 1}
            className="border-foreground/15 text-foreground/40 hover:border-foreground/40 hover:text-foreground disabled:opacity-20 border px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-200 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => push({ page: p })}
              className={`border px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-200 ${
                p === currentPage
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/15 text-foreground/40 hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {String(p).padStart(2, "0")}
            </button>
          ))}
          <button
            onClick={() => push({ page: currentPage + 1 })}
            disabled={currentPage === totalPages}
            className="border-foreground/15 text-foreground/40 hover:border-foreground/40 hover:text-foreground disabled:opacity-20 border px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-200 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
