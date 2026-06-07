import axiosClient from "./axiosClient";

export type NewsArticle = {
  id: number;
  title: string;
  summary: string;
  sourceUrl: string;
  imageUrl: string;
  category: string;
  publishedAt: string | null;
  sourceName: string;
  createdAt: string;
};

export type NewsArticleDetail = NewsArticle & {
  content: string;
};

const API_BASE_URL = "/news";

class NewsService {
  // Gọi API lấy latest vff news.
  getLatestVffNews(limit = 20) {
    return axiosClient.get<NewsArticle[]>(`${API_BASE_URL}/vff/latest`, {
      params: {
        limit,
      },
    });
  }

  // Gọi API lấy latest vff news normalized.
  async getLatestVffNewsNormalized(limit = 20) {
    const response = await this.getLatestVffNews(limit);

    return Array.isArray(response.data) ? response.data : [];
  }

  // Gọi API lấy news article detail.
  getNewsArticleDetail(id: number | string) {
    return axiosClient.get<NewsArticleDetail>(`${API_BASE_URL}/${id}`);
  }
}

const newsService = new NewsService();

// Gọi API lấy news articles.
export const getNewsArticles = (limit = 20) =>
  newsService.getLatestVffNewsNormalized(limit);

// Gọi API lấy news article detail.
export const getNewsArticleDetail = (id: number | string) =>
  newsService.getNewsArticleDetail(id).then((response) => response.data);

export default newsService;
