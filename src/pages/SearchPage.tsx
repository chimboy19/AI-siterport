import { useState, useRef, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useGlobalSearch } from "../hooks/UseSearch";
import LoadingSpinner from "../components/LoadingSpinner";
import { Search, Folder, FileText, ChevronRight, X } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";

// ── i18n ──────────────────────────────────────────────────────────────────────

const translations = {
  en: {
    searchTitle: "Search",
    searchDescription: "Search across all your projects and reports.",
    searchPlaceholder: "Search projects and reports…",
    projects: "Projects",
    reports: "Reports",
    noProjectResults: "No projects match your search.",
    noReportResults: "No reports match your search.",
    startTyping: "Start typing to search your projects and reports.",
    lastUpdated: "Updated",
  },
  jp: {
    searchTitle: "検索",
    searchDescription: "すべてのプロジェクトとレポートを検索します。",
    searchPlaceholder: "プロジェクトやレポートを検索…",
    projects: "プロジェクト",
    reports: "レポート",
    noProjectResults: "一致するプロジェクトが見つかりません。",
    noReportResults: "一致するレポートが見つかりません。",
    startTyping: "検索ワードを入力してください。",
    lastUpdated: "更新",
  },
};

// ── Highlight helper ───────────────────────────────────────────────────────────

/**
 * Wraps every occurrence of `query` inside `text` with an amber highlight span.
 */
function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <span>{text}</span>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);

  return (
    <span>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-200 text-amber-900 rounded-[2px] px-0">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </span>
  );
}

// ── Search Page ───────────────────────────────────────────────────────────────

export default function SearchPage() {
  const { lang = "en" } = useParams<{ lang: string }>();
  const t = translations[lang as keyof typeof translations] || translations.en;
  const dateLocale = lang === "jp" ? ja : enUS;

  const [user] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useGlobalSearch(user?.uid, searchQuery);
  const filteredProjects = data?.projects || [];
  const filteredReports = data?.reports || [];

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ⌘K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const clearQuery = useCallback(() => {
    setSearchQuery("");
    inputRef.current?.focus();
  }, []);

  const hasQuery = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#f5f5f4]">
      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Page heading ──────────────────────────────────────────── */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t.searchTitle}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.searchDescription}</p>
        </div>

        {/* ── Search input ──────────────────────────────────────────── */}
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="pl-11 pr-24 h-12 text-base bg-white shadow-sm focus-visible:ring-1"
          />
          {/* Right side of input */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {hasQuery ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearQuery}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-border bg-muted px-1.5 text-[11px] font-medium text-muted-foreground select-none">
                <span className="text-xs">⌘</span>K
              </kbd>
            )}
          </div>
        </div>

        {/* ── Results ───────────────────────────────────────────────── */}
        {!hasQuery ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">{t.startTyping}</p>
          </div>
        ) : isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* ── Projects column ─────────────────────────────────── */}
            <section className="space-y-3">
              {/* Column header */}
              <div className="flex items-center gap-2.5 mb-3">
                <Folder className="h-4.5 w-4.5 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">{t.projects}</h2>
                <Badge variant="secondary" className="text-xs h-5 min-w-5 px-1.5 rounded-full">
                  {filteredProjects.length}
                </Badge>
              </div>

              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <Link key={project.id} to={`/${lang}/project/${project.id}`}>
                    <Card className="bg-white hover:shadow-sm hover:border-border/80 transition-all duration-150 cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Icon */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted group-hover:bg-muted/80 transition-colors">
                            <Folder className="h-5 w-5 text-muted-foreground" />
                          </div>
                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              <HighlightedText text={project.name} query={searchQuery} />
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {t.lastUpdated}{" "}
                              {project.updatedAt
                                ? format(project.updatedAt.toDate(), "d MMM yyyy", { locale: dateLocale })
                                : project.createdAt
                                ? format(project.createdAt.toDate(), "d MMM yyyy", { locale: dateLocale })
                                : "—"}
                            </p>
                          </div>
                          {/* Arrow */}
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card className="bg-white">
                  <CardContent className="flex items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">{t.noProjectResults}</p>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* ── Reports column ──────────────────────────────────── */}
            <section className="space-y-3">
              {/* Column header */}
              <div className="flex items-center gap-2.5 mb-3">
                <FileText className="h-4.5 w-4.5 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-foreground">{t.reports}</h2>
                <Badge variant="secondary" className="text-xs h-5 min-w-5 px-1.5 rounded-full">
                  {filteredReports.length}
                </Badge>
              </div>

              {filteredReports.length > 0 ? (
                filteredReports.map((report) => (
                  <Link key={report.id} to={`/${lang}/report/${report.id}`}>
                    <Card className="bg-white hover:shadow-sm hover:border-border/80 transition-all duration-150 cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {/* Icon */}
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted group-hover:bg-muted/80 transition-colors">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          {/* Text */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              <HighlightedText text={report.title} query={searchQuery} />
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(report.date), "d MMM yyyy", { locale: dateLocale })}
                            </p>
                          </div>
                          {/* Arrow */}
                          <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-muted-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))
              ) : (
                <Card className="bg-white">
                  <CardContent className="flex items-center justify-center py-12">
                    <p className="text-sm text-muted-foreground">{t.noReportResults}</p>
                  </CardContent>
                </Card>
              )}
            </section>

          </div>
        )}
      </div>
    </div>
  );
}
