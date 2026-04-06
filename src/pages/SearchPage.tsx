import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";
import { useGlobalSearch } from "../hooks/UseSearch";
import LoadingSpinner from "../components/LoadingSpinner";
import {
  Search,
  Folder,
  FileText,
  ArrowRight,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ja, enUS } from "date-fns/locale";

const translations = {
  en: {
    searchTitle: "GLOBAL SEARCH.",
    searchDescription: "Search across all your projects and reports.",
    searchPlaceholder: "Type to search projects or reports...",
    projects: "Projects",
    reports: "Reports",
    noResults: "No results found for",
    tryDifferent: "Try a different search term.",
    lastUpdated: "Last updated",
    date: "Date",
  },
  jp: {
    searchTitle: "グローバル検索",
    searchDescription: "すべてのプロジェクトとレポートを検索します。",
    searchPlaceholder: "プロジェクトやレポートを検索...",
    projects: "プロジェクト",
    reports: "レポート",
    noResults: "結果が見つかりませんでした：",
    tryDifferent: "別の検索ワードを試してください。",
    lastUpdated: "最終更新",
    date: "日付",
  },
};

export default function SearchPage() {
  const { lang = "en" } = useParams<{ lang: string }>();
  const t = translations[lang as keyof typeof translations] || translations.en;
  const dateLocale = lang === "jp" ? ja : enUS;

  const [user] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data, isLoading } = useGlobalSearch(user?.uid, searchQuery);
  
  const filteredProjects = data?.projects || [];
  const filteredReports = data?.reports || [];

  if (isLoading && searchQuery.trim())
    return (
      <div className="min-h-screen bg-white">
        <LoadingSpinner />
      </div>
    );

  return (
    <div className="min-h-screen bg-white pb-12">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tighter mb-4">
            {t.searchTitle}
          </h1>
          <p className="text-ink/60 text-lg">{t.searchDescription}</p>
        </header>

        {/* Search Bar */}
        <div className="relative group mb-16">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-ink/20 group-focus-within:text-ink transition-colors" />
          <input
            type="text"
            autoFocus
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-6 py-6 border border-ink focus:border-ink outline-none transition-all text-xl font-medium shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:shadow-none"
          />
        </div>

        {searchQuery.trim() ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Projects Results */}
            <section>
              <h2 className="text-2xl font-display font-bold mb-8 border-b border-line pb-4 flex items-center gap-3">
                <Folder className="h-6 w-6" />
                {t.projects} ({filteredProjects.length})
              </h2>
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <Link
                    key={project.id}
                    to={`/${lang}/project/${project.id}`}
                    className="block border border-line p-6 hover:border-ink transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg group-hover:underline">
                          {project.name}
                        </h3>
                        <p className="text-xs font-mono font-bold uppercase tracking-widest opacity-40 mt-1">
                          {t.lastUpdated}:{" "}
                          {project.createdAt
                            ? format(
                                project.createdAt.toDate(),
                                "MMM d, yyyy",
                                { locale: dateLocale },
                              )
                            : "-"}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
                {filteredProjects.length === 0 && (
                  <p className="text-ink/40 italic text-sm">
                    {t.noResults} "{searchQuery}"
                  </p>
                )}
              </div>
            </section>

            {/* Reports Results */}
            <section>
              <h2 className="text-2xl font-display font-bold mb-8 border-b border-line pb-4 flex items-center gap-3">
                <FileText className="h-6 w-6" />
                {t.reports} ({filteredReports.length})
              </h2>
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <Link
                    key={report.id}
                    to={`/${lang}/report/${report.id}`}
                    className="block border border-line p-6 hover:border-ink transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg group-hover:underline">
                          {report.title}
                        </h3>
                        <p className="text-xs font-mono font-bold uppercase tracking-widest opacity-40 mt-1">
                          {t.date}:{" "}
                          {format(new Date(report.date), "MMM d, yyyy", {
                            locale: dateLocale,
                          })}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
                {filteredReports.length === 0 && (
                  <p className="text-ink/40 italic text-sm">
                    {t.noResults} "{searchQuery}"
                  </p>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-line">
            <Search className="h-12 w-12 text-line mx-auto mb-6" />
            <p className="text-ink/40 font-medium">{t.tryDifferent}</p>
          </div>
        )}
      </main>
    </div>
  );
}
