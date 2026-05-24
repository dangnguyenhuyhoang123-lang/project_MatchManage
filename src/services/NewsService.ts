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
  getLatestVffNews(limit = 20) {
    return axiosClient.get<NewsArticle[]>(`${API_BASE_URL}/vff/latest`, {
      params: {
        limit,
      },
    });
  }

  async getLatestVffNewsNormalized(limit = 20) {
    const response = await this.getLatestVffNews(limit);

    return Array.isArray(response.data) ? response.data : [];
  }

  getNewsArticleDetail(id: number | string) {
    return axiosClient.get<NewsArticleDetail>(`${API_BASE_URL}/${id}`);
  }
}

const newsService = new NewsService();

export const getNewsArticles = (limit = 20) =>
  newsService.getLatestVffNewsNormalized(limit);

export const getNewsArticleDetail = (id: number | string) =>
  newsService.getNewsArticleDetail(id).then((response) => response.data);

export default newsService;
