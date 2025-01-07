import pkg from "natural";
const { WordTokenizer, PorterStemmer } = pkg;

import indonesianStopwords from "./indonesianStopwords.js";

/**
 * Mengekstrak kata kunci dari teks dengan menghapus stopwords
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

  // Inisialisasi tokenizer
  const tokenizer = new WordTokenizer();

  // Tokenisasi teks menjadi kata-kata, diubah menjadi huruf kecil
  let tokens = tokenizer.tokenize(text.toLowerCase());

  // Menghapus tanda baca dan karakter non-alfabet
  tokens = tokens
    .map((word) => word.replace(/[^a-zA-Z0-9]/g, ""))
    .filter((word) => word.length > 0);

  // Menghapus stopwords
  const filteredTokens = tokens.filter(
    (token) => !indonesianStopwords.includes(token)
  );

  // Stemming
  const stemmedTokens = filteredTokens.map((token) =>
    PorterStemmer.stem(token)
  );

  // Menghapus duplikat
  let uniqueTokens = [...new Set(stemmedTokens)];

  // Membatasi jumlah kata kunci jika diperlukan
  if (maxKeywords && typeof maxKeywords === "number") {
    uniqueTokens = uniqueTokens.slice(0, maxKeywords);
  }

  return uniqueTokens;
}
