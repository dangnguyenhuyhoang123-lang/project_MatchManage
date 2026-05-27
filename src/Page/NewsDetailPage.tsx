import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, ExternalLink, User } from "lucide-react";

import { Footer } from "../components/Footer/Footer_HomePage";
import LoadingSpinner from "../components/Spinner/LoadingSpinner";
import NewsService, {
  type NewsArticle,
  type NewsArticleDetail,
} from "../services/NewsService";

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

function splitParagraphs(content?: string | null) {
  return (content ?? "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function getImageUrl(article: Pick<NewsArticle, "imageUrl">) {
  return article.imageUrl?.trim() || fallbackImage;
}

const NewsDetailPage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState<NewsArticleDetail | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadArticle = async () => {
      if (!id) {
        setError("Không xác định được bài viết.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [detailResponse, latestArticles] = await Promise.all([
          NewsService.getNewsArticleDetail(id),
          NewsService.getLatestVffNewsNormalized(8),
        ]);

        if (mounted) {
          setArticle(detailResponse.data);
          setRelatedArticles(
            latestArticles
              .filter((item) => String(item.id) !== String(id))
              .slice(0, 5),
          );
        }
      } catch (err) {
        console.error("Cannot load news detail", err);
        if (mounted) {
          setError("Không thể tải chi tiết bài viết từ hệ thống.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadArticle();

    return () => {
      mounted = false;
    };
  }, [id]);

  const paragraphs = splitParagraphs(article?.content || article?.summary);

  return (
    <>
      <main className="mx-auto max-w-7xl px-6 py-12 md:px-10">
        <Link
          to="/news"
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm transition hover:text-green-700"
        >
          <ArrowLeft size={16} />
          Quay lại tin tức
        </Link>

        {loading ? (
          <LoadingSpinner
            message="Đang tải bài viết"
            description="Chi tiết tin tức đang được đồng bộ từ hệ thống."
            fullHeight
          />
        ) : error ? (
          <section className="rounded-3xl border border-red-100 bg-red-50 p-8 text-red-600">
            <h1 className="mb-2 text-2xl font-black">
              Không tải được bài viết
            </h1>
            <p className="text-sm font-semibold">{error}</p>
          </section>
        ) : article ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <article className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-gray-100">
              <div className="relative h-[320px] overflow-hidden md:h-[460px]">
                <img
                  src={getImageUrl(article)}
                  alt={article.title}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                  <span className="mb-4 inline-flex rounded-full bg-green-600 px-3 py-1 text-xs font-black uppercase tracking-wide text-white">
                    {article.category || "Tin tức"}
                  </span>
                  <h1 className="max-w-4xl text-3xl font-black leading-tight text-white md:text-5xl">
                    {article.title}
                  </h1>
                </div>
              </div>

              <div className="space-y-8 p-6 md:p-10">
                <div className="flex flex-wrap items-center gap-5 border-b border-gray-100 pb-6 text-sm font-semibold text-gray-500">
                  <span className="inline-flex items-center gap-2">
                    <Calendar size={16} />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <User size={16} />
                    {article.sourceName || "VFF"}
                  </span>
                </div>

                <p className="rounded-2xl bg-[#f5f3ef] p-5 text-lg font-semibold leading-8 text-gray-800">
                  {article.summary}
                </p>

                <div className="space-y-5 text-base leading-8 text-gray-700 md:text-lg">
                  {paragraphs.map((paragraph, index) => (
                    <p key={`${paragraph.slice(0, 24)}-${index}`}>
                      {paragraph}
                    </p>
                  ))}
                </div>

                {article.sourceUrl && (
                  <a
                    href={article.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-green-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-green-800"
                  >
                    Xem nguồn gốc
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </article>

            <RelatedNewsSidebar articles={relatedArticles} />
          </div>
        ) : null}
      </main>
      <Footer />
    </>
  );
};

function RelatedNewsSidebar({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-end justify-between border-b border-gray-100 pb-4">
          <h2 className="text-3xl font-black uppercase tracking-tight text-blue-800">
            Nổi bật
          </h2>
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">
            Tin khác
          </span>
        </div>

        <div className="space-y-6">
          {articles.map((item) => (
            <Link
              key={item.id}
              to={`/news/${item.id}`}
              className="group block"
            >
              <div className="overflow-hidden rounded-2xl bg-[#f5f3ef]">
                <img
                  src={getImageUrl(item)}
                  alt={item.title}
                  className="h-40 w-full object-cover transition duration-500 group-hover:scale-105"
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                />
              </div>

              <div className="mt-3 space-y-2">
                <span className="inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-green-700">
                  {item.category || "Tin tức"}
                </span>
                <h3 className="text-sm font-black leading-6 text-gray-900 transition group-hover:text-green-700">
                  {item.title}
                </h3>
                <p className="text-xs font-semibold text-gray-400">
                  {formatDate(item.publishedAt)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default NewsDetailPage;
