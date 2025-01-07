import { getRelatedNews } from "../../services/newsService.js";
import NewsAPI from 'newsapi';
import dotenv from 'dotenv';
import logger from "../../middlewares/loggingMiddleware.js";

jest.mock('newsapi');
jest.mock('../../middlewares/loggingMiddleware.js');

dotenv.config();

describe("News Service", () => {
  let newsapiInstance;

  beforeEach(() => {
    newsapiInstance = {
      v2: {
        everything: jest.fn(),
      },
    };
    NewsAPI.mockImplementation(() => newsapiInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("harus mengambil berita terkait dengan query yang valid", async () => {
    const mockResponse = {
      status: "ok",
      articles: [
        {
          title: "Berita 1",
          description: "Deskripsi berita 1",
          url: "https://sumber.berita.com/artikel1",
          source: { name: "Sumber Berita" },
          publishedAt: "2025-01-05T08:00:00Z",
        },
        {
          title: "Berita 2",
          description: "Deskripsi berita 2",
          url: "https://sumber.berita.com/artikel2",
          source: { name: "Sumber Berita" },
          publishedAt: "2025-01-04T08:00:00Z",
        },
      ],
    };

    newsapiInstance.v2.everything.mockResolvedValue(mockResponse);

    const query = "vaksin covid-19 microchip";
    const articles = await getRelatedNews(query);

    expect(newsapiInstance.v2.everything).toHaveBeenCalledWith({
      q: "vaksin covid-19 microchip OR vaksin covid-19 OR microchip",
      language: 'id',
      sortBy: 'relevancy',
      pageSize: 5,
    });

    expect(articles).toEqual([
      {
        title: "Berita 1",
        description: "Deskripsi berita 1",
        url: "https://sumber.berita.com/artikel1",
        source: "Sumber Berita",
        publishedAt: "2025-01-05T08:00:00Z",
      },
      {
        title: "Berita 2",
        description: "Deskripsi berita 2",
        url: "https://sumber.berita.com/artikel2",
        source: "Sumber Berita",
        publishedAt: "2025-01-04T08:00:00Z",
      },
    ]);

    expect(logger.info).toHaveBeenCalledWith(`Berhasil mengambil 2 berita terkait untuk query: ${query}`);
  });

  it("harus menangani error dari News API", async () => {
    newsapiInstance.v2.everything.mockRejectedValue(new Error("Network Error"));

    const query = "vaksin covid-19 microchip";
    const articles = await getRelatedNews(query);

    expect(newsapiInstance.v2.everything).toHaveBeenCalledWith({
      q: "vaksin covid-19 microchip OR vaksin covid-19 OR microchip",
      language: 'id',
      sortBy: 'relevancy',
      pageSize: 5,
    });

    expect(articles).toEqual([]);
    expect(logger.error).toHaveBeenCalledWith(`Error mengambil berita terkait: Network Error`);
  });
});
