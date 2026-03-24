"use client";

import { useCallback, useMemo, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

import BlogItem from "./BlogItem";
import { ArticleData } from "../services/article.type";

const PAGE_SIZE = 6;
type SortOrder = "asc" | "desc";

type Props = { articles: ArticleData[]; isEmpty?: boolean };

export default function ArticlesClient({ articles, isEmpty }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read state from URL
  const query = searchParams.get("q") ?? "";
  const activeTags = useMemo(() => searchParams.getAll("tag"), [searchParams]);
  const sort = (searchParams.get("sort") ?? "asc") as SortOrder;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  // Helper: push new params
  const push = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        params.delete(key);
        if (val === null) return;
        if (Array.isArray(val)) val.forEach((v) => params.append(key, v));
        else params.set(key, val);
      });
      // Reset page on filter/sort change (unless explicitly setting page)
      if (!("page" in updates)) params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, router, pathname],
  );

  const allTags = useMemo(() => {
    const set = new Set<string>();
    articles.forEach((a) => a.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [articles]);

  const filtered = useMemo(() => {
    let result = [...articles];
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((a) => a.title.toLowerCase().includes(q));
    }
    if (activeTags.length > 0) {
      result = result.filter((a) =>
        activeTags.every((t) => a.tags?.includes(t)),
      );
    }
    result.sort((a, b) => {
      const cmp = a.title.localeCompare(b.title);
      return sort === "asc" ? cmp : -cmp;
    });
    return result;
  }, [articles, query, activeTags, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Clamp page if out of range after filter changes
  useEffect(() => {
    if (page > totalPages) push({ page: String(totalPages) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const handleTag = useCallback(
    (tag: string) => {
      const next = activeTags.includes(tag)
        ? activeTags.filter((t) => t !== tag)
        : [...activeTags, tag];
      push({ tag: next.length > 0 ? next : null });
    },
    [activeTags, push],
  );

  const isFiltered = query.trim() || activeTags.length > 0;
  const isLastPage = page >= totalPages && filtered.length > 0;

  // --- Empty DB state ---
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
      {/* Controls */}
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
              value={query}
              onChange={(e) => push({ q: e.target.value || null })}
              placeholder="Search articles..."
              className="border-foreground/15 bg-foreground/3 text-foreground placeholder:text-foreground/30 focus:border-foreground/40 w-full rounded-none border py-3 pr-4 pl-10 text-sm outline-none transition-colors duration-200"
            />
          </div>

          {/* Sort */}
          <div className="border-foreground/15 flex shrink-0 overflow-hidden border">
            <button
              onClick={() => push({ sort: "asc" })}
              className={`px-4 py-3 text-xs font-semibold tracking-widest uppercase transition-colors duration-200 ${
                sort === "asc"
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
                sort === "desc"
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
              const active = activeTags.includes(tag);
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
            {activeTags.length > 0 && (
              <button
                onClick={() => push({ tag: null })}
                className="border-foreground/15 text-foreground/30 hover:text-foreground border px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase transition-colors duration-200"
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
          {activeTags.length > 0 && ` · ${activeTags.join(", ")}`}
          {query && ` · "${query}"`}
        </span>
        {totalPages > 1 && (
          <span>
            {page} / {totalPages}
          </span>
        )}
      </div>

      {/* List */}
      <div className="flex flex-col">
        {paginated.length > 0 ? (
          <>
            {paginated.map((post, idx) => (
              <BlogItem
                key={post.slug}
                data={post}
                index={(page - 1) * PAGE_SIZE + idx}
              />
            ))}
            <div className="border-foreground/10 border-t" />

            {/* End of results message — always show on last page */}
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
            onClick={() => push({ page: String(page - 1) })}
            disabled={page === 1}
            className="border-foreground/15 text-foreground/40 hover:border-foreground/40 hover:text-foreground disabled:opacity-20 border px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-200 disabled:cursor-not-allowed"
          >
            ← Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => push({ page: String(p) })}
              className={`border px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-200 ${
                p === page
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/15 text-foreground/40 hover:border-foreground/40 hover:text-foreground"
              }`}
            >
              {String(p).padStart(2, "0")}
            </button>
          ))}
          <button
            onClick={() => push({ page: String(page + 1) })}
            disabled={page === totalPages}
            className="border-foreground/15 text-foreground/40 hover:border-foreground/40 hover:text-foreground disabled:opacity-20 border px-4 py-2.5 text-xs font-semibold tracking-widest uppercase transition-colors duration-200 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
