import { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ExternalLink,
  LayoutGrid,
  List,
  RefreshCw,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Footer } from "../components/Footer/Footer_HomePage";
import LoadingSpinner from "../components/Spinner/LoadingSpinner";
import NewsService, { type NewsArticle } from "../services/NewsService";

const fallbackImage =
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=80";

function formatDate(value?: string | null) {
  if (!value) return "Chưa cập nhật";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getArticleImage(article: NewsArticle) {
  return article.imageUrl?.trim() || fallbackImage;
}

export const NewsPage = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = useState(8);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await NewsService.getLatestVffNewsNormalized(20);
      setArticles(data);
    } catch (err) {
      console.error("Cannot load news articles", err);
      setError("Không thể tải danh sách tin tức từ hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const categories = useMemo(() => {
    const values = articles
      .map((article) => article.category?.trim())
      .filter((category): category is string => Boolean(category));

    return ["Tất cả", ...Array.from(new Set(values))];
  }, [articles]);

  const filteredArticles = useMemo(() => {
    if (selectedCategory === "Tất cả") return articles;

    return articles.filter((article) => article.category === selectedCategory);
  }, [articles, selectedCategory]);

  const featuredArticles = filteredArticles.slice(0, 3);
  const mainFeatured = featuredArticles[0];
  const sideFeatured = featuredArticles.slice(1, 3);
  const latestArticles = filteredArticles.slice(3, visibleCount + 3);
  const trendingArticles = articles.slice(0, 5);
  const canLoadMore = filteredArticles.length > visibleCount + 3;

  return (
    <>
      <div className="pt-12">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <section className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-black uppercase tracking-widest text-green-700">
                VFF News
              </p>
              <h1 className="text-4xl font-black tracking-tight text-gray-950 md:text-5xl">
                Tin tức bóng đá
              </h1>
            </div>

            <button
              type="button"
              onClick={loadNews}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 shadow-sm transition hover:border-green-200 hover:text-green-700"
            >
              <RefreshCw size={16} />
              Làm mới
            </button>
          </section>

          {loading ? (
            <LoadingSpinner
              message="Đang tải tin tức"
              description="Hệ thống đang đồng bộ các bài viết mới nhất từ nguồn tin VFF."
              fullHeight
            />
          ) : error ? (
            <section className="mb-24 rounded-3xl border border-red-100 bg-red-50 p-8 text-red-600">
              <h2 className="mb-2 text-xl font-black">Không tải được tin tức</h2>
              <p className="text-sm font-semibold">{error}</p>
            </section>
          ) : articles.length === 0 ? (
            <section className="mb-24 rounded-3xl border border-gray-100 bg-white p-8 text-center text-sm font-bold text-gray-500">
              Chưa có bài viết nào được đồng bộ.
            </section>
          ) : (
            <>
              <section className="mb-16">
                <h2 className="mb-8 text-3xl font-bold text-gray-900">
                  Tin nổi bật
                </h2>

                <div className="grid h-auto grid-cols-1 gap-6 lg:h-125 lg:grid-cols-3">
                  {mainFeatured && <FeaturedHero article={mainFeatured} />}

                  <div className="flex flex-col gap-6 lg:h-full">
                    {sideFeatured.map((article) => (
                      <SmallFeaturedCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>
              </section>

              <section className="mb-24 flex flex-col gap-10 xl:flex-row">
                <div className="xl:w-2/3">
                  <div className="mb-8 flex items-center justify-between border-b-2 border-gray-200 pb-4">
                    <h2 className="relative text-2xl font-bold text-gray-900">
                      Tin mới cập nhật
                      <span className="absolute -bottom-4.5 left-0 h-1 w-16 bg-[#1a6e38]" />
                    </h2>

                    <div className="flex items-center gap-3 text-gray-400">
                      <button
                        type="button"
                        onClick={() => setViewMode("grid")}
                        className={`p-1 transition-colors hover:text-gray-800 ${
                          viewMode === "grid" ? "text-gray-800" : ""
                        }`}
                        aria-label="Xem dạng lưới"
                      >
                        <LayoutGrid size={20} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setViewMode("list")}
                        className={`p-1 transition-colors hover:text-gray-800 ${
                          viewMode === "list" ? "text-gray-800" : ""
                        }`}
                        aria-label="Xem dạng danh sách"
                      >
                        <List size={20} />
                      </button>
                    </div>
                  </div>

                  <div
                    className={
                      viewMode === "grid"
                        ? "mb-10 grid grid-cols-1 gap-8 md:grid-cols-2"
                        : "mb-10 space-y-5"
                    }
                  >
                    {latestArticles.map((article) => (
                      <NewsCard
                        key={article.id}
                        article={article}
                        compact={viewMode === "list"}
                      />
                    ))}
                  </div>

                  {latestArticles.length === 0 && (
                    <div className="mb-10 rounded-2xl bg-white p-8 text-center text-sm font-bold text-gray-500">
                      Không có tin tức trong danh mục này.
                    </div>
                  )}

                  {canLoadMore && (
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisibleCount((count) => count + 4)}
                        className="rounded-full bg-gray-100 px-8 py-3 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-200"
                      >
                        Xem thêm tin tức
                      </button>
                    </div>
                  )}
                </div>

                <aside className="flex flex-col gap-8 xl:w-1/3">
                  <section className="rounded-3xl border border-gray-100 bg-white p-8">
                    <h3 className="mb-6 text-xl font-bold text-gray-900">
                      Danh mục
                    </h3>

                    <div className="flex flex-wrap gap-3">
                      {categories.map((category) => {
                        const isActive = selectedCategory === category;

                        return (
                          <button
                            key={category}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(category);
                              setVisibleCount(8);
                            }}
                            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                              isActive
                                ? "bg-gray-800 text-white"
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {category}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                  <section className="rounded-3xl border border-gray-100 bg-white p-8">
                    <h3 className="mb-6 text-xl font-bold text-gray-900">
                      Xu hướng
                    </h3>

                    <div className="space-y-6">
                      {trendingArticles.map((article, index) => (
                        <Link
                          key={article.id}
                          to={`/news/${article.id}`}
                          className="flex gap-4"
                        >
                          <span className="text-4xl font-black leading-none text-gray-200">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <div>
                            <h4 className="mb-1 font-bold leading-snug text-gray-800 transition-colors hover:text-green-700">
                              {article.title}
                            </h4>
                            <span className="text-xs text-gray-400">
                              {formatDate(article.publishedAt)}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </section>

                  <section className="relative overflow-hidden rounded-3xl bg-green-700 p-8 text-white">
                    <div className="relative z-10">
                      <h3 className="mb-4 text-2xl font-bold">
                        Đừng bỏ lỡ nhịp đập bóng đá!
                      </h3>

                      <p className="mb-6 text-sm leading-relaxed text-green-100">
                        Theo dõi các cập nhật mới nhất từ VFF và hệ thống quản
                        lý bóng đá.
                      </p>
                    </div>

                    <div className="absolute right-0 top-0 h-32 w-32 -translate-y-10 translate-x-10 rounded-full bg-white opacity-5" />
                    <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-10 translate-y-10 rounded-full bg-black opacity-10" />
                  </section>
                </aside>
              </section>
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

function FeaturedHero({ article }: { article: NewsArticle }) {
  return (
    <Link
      to={`/news/${article.id}`}
      className="group relative h-100 cursor-pointer overflow-hidden rounded-3xl lg:col-span-2 lg:h-full"
    >
      <img
        src={getArticleImage(article)}
        alt={article.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(event) => {
          event.currentTarget.src = fallbackImage;
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 flex flex-col justify-end p-8">
        <span className="mb-4 inline-block w-fit rounded-full bg-green-600 px-3 py-1 text-xs font-bold text-white">
          {article.category || "Tin tức"}
        </span>

        <h3 className="mb-3 text-3xl font-extrabold leading-tight text-white md:text-4xl">
          {article.title}
        </h3>

        <p className="mb-6 line-clamp-2 max-w-2xl text-sm text-gray-200 md:text-base">
          {article.summary}
        </p>

        <ArticleMeta article={article} light />
      </div>
    </Link>
  );
}

function SmallFeaturedCard({ article }: { article: NewsArticle }) {
  return (
    <Link
      to={`/news/${article.id}`}
      className="group relative min-h-62.5 flex-1 cursor-pointer overflow-hidden rounded-3xl"
    >
      <img
        src={getArticleImage(article)}
        alt={article.title}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        onError={(event) => {
          event.currentTarget.src = fallbackImage;
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6">
        <span className="mb-3 inline-block w-fit rounded-full bg-indigo-500 px-2 py-1 text-[10px] font-bold text-white">
          {article.category || "Tin tức"}
        </span>

        <h3 className="text-xl font-bold leading-snug text-white">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}

function NewsCard({
  article,
  compact,
}: {
  article: NewsArticle;
  compact: boolean;
}) {
  return (
    <Link
      to={`/news/${article.id}`}
      className={`overflow-hidden rounded-2xl border border-gray-100/50 bg-white shadow-sm transition-shadow hover:shadow-md ${
        compact ? "grid grid-cols-1 md:grid-cols-[220px_1fr]" : "flex flex-col"
      }`}
    >
      <div className={compact ? "h-48 md:h-full" : "h-48"}>
        <img
          src={getArticleImage(article)}
          alt={article.title}
          className="h-full w-full object-cover"
          onError={(event) => {
            event.currentTarget.src = fallbackImage;
          }}
        />
      </div>

      <div className="flex grow flex-col p-6">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="text-xs font-bold tracking-wider text-green-700">
            {article.category || "Tin tức"}
          </span>
          <span className="shrink-0 text-xs text-gray-400">
            {formatDate(article.publishedAt)}
          </span>
        </div>

        <h3 className="mb-3 text-lg font-bold leading-snug text-gray-900">
          {article.title}
        </h3>

        <p className="mb-6 line-clamp-2 text-sm text-gray-500">
          {article.summary}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3">
          <ArticleMeta article={article} />
          <ExternalLink size={16} className="shrink-0 text-gray-400" />
        </div>
      </div>
    </Link>
  );
}

function ArticleMeta({
  article,
  light = false,
}: {
  article: NewsArticle;
  light?: boolean;
}) {
  const textClass = light ? "text-gray-300" : "text-gray-500";

  return (
    <div className={`flex flex-wrap items-center gap-4 text-sm ${textClass}`}>
      <div className="flex items-center gap-2">
        <Calendar size={16} />
        <span>{formatDate(article.publishedAt)}</span>
      </div>

      <div className="flex items-center gap-2">
        <User size={16} />
        <span>{article.sourceName || "VFF"}</span>
      </div>
    </div>
  );
}

export default NewsPage;
