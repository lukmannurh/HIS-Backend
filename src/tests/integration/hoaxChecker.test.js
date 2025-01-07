// src/tests/integration/hoaxChecker.test.js

import { checkHoax } from "../../services/hoaxChecker.js";
import { getRelatedNews } from "../../services/newsService.js";
import { extractKeywords } from "../../utils/keywordExtractor.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../../middlewares/loggingMiddleware.js";

jest.mock("../../services/newsService.js");
jest.mock("../../utils/keywordExtractor.js");
jest.mock("@google/generative-ai");
jest.mock("../../middlewares/loggingMiddleware.js");

describe("Hoax Checker Service", () => {
  let genAIInstance;
  let modelInstance;

  beforeEach(() => {
    modelInstance = {
      generateContent: jest.fn(),
    };
    genAIInstance = {
      getGenerativeModel: jest.fn().mockReturnValue(modelInstance),
    };
    GoogleGenerativeAI.mockImplementation(() => genAIInstance);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("harus mengembalikan hoax dengan berita terkait", async () => {
    const content = "vaksin covid-19 terdapat microchip";
    const link = "";

    // Mock Gemini AI response
    modelInstance.generateContent.mockResolvedValue({
      response: {
        text: jest.fn().mockResolvedValue("Hoaks\nKlaim tersebut tidak didukung bukti ilmiah. Tidak ada bukti yang menunjukkan adanya microchip dalam vaksin COVID-19.\n"),
      },
    });

    // Mock ekstraksi kata kunci
    extractKeywords.mockReturnValue("vaksin covid-19 OR microchip");

    // Mock News API
    getRelatedNews.mockResolvedValue([
      {
        title: "Berita Terkait 1",
        description: "Deskripsi berita terkait 1",
        url: "https://sumber.berita.com/artikel1",
        source: "Sumber Berita",
        publishedAt: "2025-01-05T08:00:00Z",
      },
    ]);

    const result = await checkHoax(content, link);

    expect(genAIInstance.getGenerativeModel).toHaveBeenCalledWith({ model: "gemini-1.5-flash" });
    expect(modelInstance.generateContent).toHaveBeenCalled();
    expect(extractKeywords).toHaveBeenCalledWith(content);
    expect(getRelatedNews).toHaveBeenCalledWith("vaksin covid-19 OR microchip");

    expect(result.validationStatus).toBe("hoax");
    expect(result.validationDetails).toContain('"judgement":"Hoaks"');
    expect(result.relatedNews.length).toBe(1);
    expect(result.relatedNews[0].title).toBe("Berita Terkait 1");
  });

  it("harus mengembalikan valid tanpa berita terkait", async () => {
    const content = "vaksin covid-19 aman dan efektif";
    const link = "";

    // Mock Gemini AI response
    modelInstance.generateContent.mockResolvedValue({
      response: {
        text: jest.fn().mockResolvedValue("Asli\nVaksin COVID-19 telah terbukti aman dan efektif melalui berbagai uji klinis.\n"),
      },
    });

    // Mock ekstraksi kata kunci
    extractKeywords.mockReturnValue("vaksin covid-19 OR aman OR efektif");

    // Tidak perlu memanggil News API jika valid
    const result = await checkHoax(content, link);

    expect(genAIInstance.getGenerativeModel).toHaveBeenCalledWith({ model: "gemini-1.5-flash" });
    expect(modelInstance.generateContent).toHaveBeenCalled();
    expect(extractKeywords).toHaveBeenCalledWith(content);
    expect(getRelatedNews).not.toHaveBeenCalled();

    expect(result.validationStatus).toBe("valid");
    expect(result.validationDetails).toContain('"judgement":"Asli"');
    expect(result.relatedNews.length).toBe(0);
  });
});
