import indonesianStopwords from "./indonesianStopwords.js";
import { Stemmer } from "sastrawijs";

/**
 * Mengekstrak kata kunci dari teks dengan menghapus stopwords
 * hanya jika token cocok secara eksak (exact match).
 *
 * @param {string} text - Teks yang akan diekstrak kata kuncinya
 * @param {number} [maxKeywords] - Jumlah maksimum kata kunci yang diinginkan
 * @returns {string[]} - Array kata kunci unik
 *
 * @example
 * const keywords = extractKeywords("Ini adalah contoh kalimat yang mengandung beberapa stop words.", 3);
 * console.log(keywords); // ["contoh", "kalimat", "mengandung"]
 */
export function extractKeywords(text, maxKeywords = null) {
  if (!text) return [];

  const stemmer = new Stemmer();

  // 1. Tokenisasi teks menjadi kata-kata, diubah menjadi huruf kecil
  let tokens = text.toLowerCase().split(/\s+/);

  // 2. Buang karakter non-alfanumerik hanya di *awal/akhir token*
  tokens = tokens
    .map((word) => word.replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "")) // hapus tanda baca di awal/akhir
    .filter(Boolean); // hapus token kosong

  // 3. Menghapus stopwords hanya jika token = stopword (exact match)
  const filteredTokens = tokens.filter(
    (token) => !indonesianStopwords.includes(token)
  );

  // 4. Lakukan stemming dengan Sastrawi
  const stemmedTokens = filteredTokens.map((token) => stemmer.stem(token));

  // 5. Menghapus duplikat
  let uniqueTokens = [...new Set(stemmedTokens)];

  // 6. Membatasi jumlah kata kunci jika diperlukan
  if (maxKeywords && typeof maxKeywords === "number") {
    uniqueTokens = uniqueTokens.slice(0, maxKeywords);
  }

  return uniqueTokens;
}
