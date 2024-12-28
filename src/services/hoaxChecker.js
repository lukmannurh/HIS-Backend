import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Memanggil Gemini 1.5 Flash (multi-bahasa, utamanya Indonesia)
 * untuk menilai statement,
 * lalu beri output "Hoaks"/"Asli", 1 kalimat penjelasan singkat, dan link.
 *
 * @param {string} content - Pernyataan pengguna
 * @param {string} link - Link (opsional) yang diberikan pengguna
 * @returns {Object} { validationStatus, validationDetails }
 *    - validationStatus: "hoax" atau "valid"
 *    - validationDetails: JSON string, isinya { gemini: { output, judgement, explanation, link } }
 */
export async function checkHoax(content, link) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const promptText = `
Kamu adalah pendeteksi hoaks berkemampuan multi-bahasa (terutama Indonesia).
Pengguna mengirimkan pernyataan dan link (jika ada).
Tugasmu:
1. Tentukan apakah pernyataan itu "Hoaks" atau "Asli" (gunakan bahasa Indonesia).
2. Berikan penjelasan singkat (maksimal 2 kalimat).
3. Sertakan sumber berita terkait di baris terakhir. Jika sumber tidak ada atau kosong, tetap beri baris terakhir kosong.

Format output:
Hoaks / Asli (hanya salah satu)
[Penjelasan singkat 1 atau 2 kalimat]
[sumber berita terkait]

Pernyataan: "${content}"
Link: "${link || ""}"

Pastikan HANYA menampilkan tiga baris tersebut.
    `;

    const prompt = [{ text: promptText }];
    const result = await model.generateContent(prompt);

    // result.response = ReadableStream
    const response = await result.response;
    const textOutput = response.text(); // string

    if (!textOutput) {
      console.error("Gemini response empty or error.");
      return {
        validationStatus: "unknown",
        validationDetails: "Gemini returned no output",
      };
    }

    // Tampilkan di console untuk debug
    console.log("Gemini raw output:\n", textOutput.trim());

    //
    // Ekstrak hasil:
    // Harapan 3 baris, misalnya:
    // Hoaks
    // Ini penjelasan singkat...
    // https://some-link.com
    //
    const lines = textOutput
      .trim()
      .split("\n")
      .map((l) => l.trim());
    // lines[0] => "Hoaks" atau "Asli"
    // lines[1] => penjelasan singkat
    // lines[2] => link

    if (lines.length < 2) {
      // fallback
      console.warn(
        "Gemini output not in expected 3-line format. Full = ",
        lines
      );
      return {
        validationStatus: "unknown",
        validationDetails: `Gemini uncertain: ${textOutput}`,
      };
    }

    const judgement = lines[0];
    const explanation = lines[1] || "";
    const userLink = lines[2] || "";

    let validationStatus = "unknown";
    if (judgement.toLowerCase().includes("hoaks")) {
      validationStatus = "hoax";
    } else if (judgement.toLowerCase().includes("asli")) {
      validationStatus = "valid";
    } else {
      // fallback
      console.warn("Gemini did not output 'Hoaks' or 'Asli'.");
      validationStatus = "unknown";
    }

    // Buat detail JSON
    const validationDetails = JSON.stringify({
      gemini: {
        output: textOutput, // teks mentah
        judgement, // baris 0
        explanation, // baris 1
        link: userLink, // baris 2
      },
    });

    return {
      validationStatus,
      validationDetails,
    };
  } catch (error) {
    console.error("Error in checkHoax (Gemini):", error.message);
    return {
      validationStatus: "unknown",
      validationDetails: "Error checking hoax via Gemini",
    };
  }
}
