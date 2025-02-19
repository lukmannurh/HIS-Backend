import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from "../middlewares/loggingMiddleware.js";
import { extractKeywords } from "../utils/keywordExtractor.js";
import { scrapeDetikSearch } from "./hoaxOrNotDetikScraper.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function checkHoax(content, link, document) {
  try {
    logger.info(`Memulai ekstraksi kata kunci untuk konten: "${content}"`, { timestamp: new Date().toISOString() });
    
    // Ekstraksi kata kunci dari konten
    const allKeywords = extractKeywords(content, 3);
    const keywords = allKeywords.join(",");
    logger.info(`Kata kunci yang diekstrak: "${keywords}"`, { timestamp: new Date().toISOString() });
    
    // Lakukan scraping related news menggunakan kata kunci
    let relatedNews = [];
    if (keywords) {
      relatedNews = await scrapeDetikSearch(keywords, 5);
    }
    
    logger.info(`Memulai fact-checking dengan Gemini untuk konten: "${content}"`, { timestamp: new Date().toISOString() });
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Jika dokumen ada, tambahkan informasi dokumen ke prompt
    const documentPart = document ? `\nDokumen: ${document}` : "";
    
    const promptText = `
Anda adalah fact-checker multibahasa dengan keahlian dalam mendeteksi hoaks dan melakukan validasi informasi dengan bahasa yang berpendidikan dan komprehensif.
Tugas Anda:
1. Evaluasi pernyataan berikut dan tentukan status validasinya:
   - "Hoax" jika pernyataan tersebut jelas tidak benar.
   - "Valid" jika pernyataan tersebut didukung oleh bukti yang kuat.
   - "Diragukan" jika informasi tidak cukup atau Anda kurang yakin.
2. Berikan penjelasan komprehensif yang mendukung keputusan Anda.
3. Sertakan sumber berita terkait pada baris ketiga. Jika tidak ada sumber, gunakan "-" sebagai placeholder.

Format output (3 baris):
<Status Validasi>
<Penjelasan Komprehensif>
<Sumber Berita>

Pernyataan: "${content}"
Link: "${link || ""}"${documentPart}

Pastikan output selalu terdiri atas 3 baris.
    `;
    
    const prompt = [{ text: promptText }];
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textOutput = await response.text();

    if (!textOutput) {
      logger.error("Gemini tidak mengembalikan output.", { timestamp: new Date().toISOString() });
      return {
        validationStatus: "diragukan",
        validationDetails: "Gemini tidak mengembalikan output",
        relatedNews,
      };
    }
    
    logger.info(`Gemini raw output:\n${textOutput.trim()}`, { timestamp: new Date().toISOString() });
    let lines = textOutput.trim().split("\n").map(l => l.trim());
    while (lines.length < 3) {
      lines.push("");
    }
    
    const statusLine = lines[0].toLowerCase();
    const explanation = lines[1] || "";
    const sourceLine = lines[2] || "";
    
    let validationStatus = "diragukan"; // default jika tidak ada kata kunci yang jelas
    if (statusLine.includes("hoax")) {
      validationStatus = "hoax";
    } else if (statusLine.includes("valid") || statusLine.includes("benar") || statusLine.includes("asli")) {
      validationStatus = "valid";
    }
    
    const validationDetails = JSON.stringify({
      gemini: {
        output: textOutput,
        statusLine,
        explanation,
        source: sourceLine,
      },
    });
    
    return {
      validationStatus,
      validationDetails,
      relatedNews,
    };
  } catch (error) {
    logger.error("Error dalam checkHoax (Gemini): " + error.message, {
      timestamp: new Date().toISOString(),
      error: { message: error.message, stack: error.stack }
    });
    return {
      validationStatus: "diragukan",
      validationDetails: "Error checking hoax via Gemini",
      relatedNews: [],
    };
  }
}
