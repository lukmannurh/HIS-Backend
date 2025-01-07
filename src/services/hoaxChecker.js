import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../middlewares/loggingMiddleware.js";
import { extractKeywords } from "../utils/keywordExtractor.js";
import { scrapeDetikSearch } from "./hoaxOrNotDetikScraper.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Memanggil Gemini 1.5 Flash untuk menilai statement,
 * lalu beri output "Hoaks"/"Asli" dengan persentase, penjelasan komprehensif, dan link berita terkait yang di-scrape dari situs resmi.
 *
 * @param {string} content - Pernyataan pengguna (dalam Bahasa Indonesia)
 * @param {string} link - Link (opsional) yang diberikan pengguna
 * @returns {Object} { validationStatus, validationDetails, relatedNews }
 */
export async function checkHoax(content, link) {
  try {
    logger.info(`Memulai fact-checking untuk konten: "${content}"`, { timestamp: new Date().toISOString() });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const promptText = `
Anda adalah fact-checker multibahasa dengan keahlian dalam mendeteksi hoaks (terutama dalam Bahasa Inggris dan Bahasa Indonesia).
Pengguna mengirimkan pernyataan dan link opsional.
Tugas Anda:
1. Tentukan apakah pernyataan tersebut "Hoaks" atau "Asli".
2. Berikan penjelasan yang komprehensif, detail, dan ilmiah atau dengan bahasa yang berpendidikan.
3. Sertakan sumber berita terkait di baris terakhir. Jika tidak ada sumber, biarkan baris terakhir kosong.

Format output:
Hoaks / Asli 
[Penjelasan komprehensif]
[sumber berita terkait]

Pernyataan: "${content}"
Link: "${link || ""}"

Pastikan HANYA tiga baris ini yang dioutput.
    `;

    const prompt = [{ text: promptText }];
    const result = await model.generateContent(prompt);

    // result.response = ReadableStream
    const response = await result.response;
    const textOutput = await response.text(); // string

    if (!textOutput) {
      logger.error("Gemini response kosong atau terjadi error.", { timestamp: new Date().toISOString() });
      return {
        validationStatus: "unknown",
        validationDetails: "Gemini tidak mengembalikan output",
        relatedNews: [],
      };
    }

    // Tampilkan raw output dari Gemini untuk debug
    logger.info(`Gemini raw output:\n${textOutput.trim()}`, { timestamp: new Date().toISOString() });

    // Ekstrak hasil
    const lines = textOutput
      .trim()
      .split("\n")
      .map((l) => l.trim());

    if (lines.length < 3) {
      // fallback jika format output tidak sesuai
      logger.warn(`Output Gemini tidak dalam format 3 baris yang diharapkan. Semua = ${JSON.stringify(lines)}`, { timestamp: new Date().toISOString() });
      return {
        validationStatus: "unknown",
        validationDetails: `Gemini tidak pasti: ${textOutput}`,
        relatedNews: [],
      };
    }

    const judgementLine = lines[0];
    const judgementParts = judgementLine.split(" - ");
    const judgement = judgementParts[0].toLowerCase();
    const percentage = judgementParts[1] ? judgementParts[1].replace('%', '').trim() : null;
    const explanation = lines[1] || "";
    const userLink = lines[2] || "";

    let validationStatus = "unknown";
    if (judgement.includes("hoaks") || judgement.includes("hoax")) {
      validationStatus = "hoax";
    } else if (judgement.includes("asli") || judgement.includes("true")) {
      validationStatus = "valid";
    } else {
      // fallback jika tidak ada keyword yang dikenali
      logger.warn("Gemini tidak mengeluarkan 'Hoaks' atau 'Asli'.", { timestamp: new Date().toISOString() });
      validationStatus = "unknown";
    }

    // Buat detail JSON
    const validationDetails = JSON.stringify({
      gemini: {
        output: textOutput, // teks mentah
        judgement, // baris 0
        percentage: percentage ? `${percentage}%` : null, // baris 0
        explanation, // baris 1
        link: userLink, // baris 2
      },
    });

    // Ekstrak kata kunci dari konten pengguna untuk mencari berita terkait
    const allKeywords = extractKeywords(content, 3); // Membatasi ke 3 kata kunci
    const keywords = allKeywords.join(","); // Menggabungkan kata kunci dengan koma
    logger.info(`Kata kunci yang diekstrak: "${keywords}"`, { timestamp: new Date().toISOString() });

    if (!keywords) {
      logger.warn(`Tidak ada kata kunci yang diekstrak dari konten: "${content}"`, { timestamp: new Date().toISOString() });
      return {
        validationStatus,
        validationDetails,
        relatedNews: [],
      };
    }

    // Scrape berita terkait dari detik.com berdasarkan kata kunci
    const relatedNews = await scrapeDetikSearch(keywords, 5); // Membatasi ke 5 artikel

    if (relatedNews.length === 0) {
      logger.warn(`Tidak ada berita terkait yang dihasilkan untuk query: "${keywords}"`, { timestamp: new Date().toISOString() });
    }

    return {
      validationStatus,
      validationDetails,
      relatedNews,
    };
  } catch (error) {
    logger.error("Error dalam checkHoax (Gemini): " + error.message, {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
        ...error,
      },
    });
    return {
      validationStatus: "unknown",
      validationDetails: "Error checking hoax via Gemini",
      relatedNews: [],
    };
  }
}
