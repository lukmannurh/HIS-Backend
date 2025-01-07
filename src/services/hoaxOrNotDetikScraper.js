import puppeteer from 'puppeteer';
import logger from '../middlewares/loggingMiddleware.js';
import Bottleneck from 'bottleneck';
import NodeCache from 'node-cache';

// Inisialisasi rate limiter dengan maksimal 1 permintaan per detik
const limiter = new Bottleneck({
  minTime: 1000, // 1000 ms = 1 detik
});

// Inisialisasi cache dengan TTL 1 jam
const newsCache = new NodeCache({ stdTTL: 3600 });

/**
 * Mengambil berita berdasarkan query dari detik.com dengan Puppeteer, rate limiting, dan caching
 * @param {string} query - Query pencarian
 * @param {number} [maxArticles=5] - Jumlah maksimum artikel yang diambil
 * @returns {Array} - Daftar artikel
 */
export async function scrapeDetikSearch(query, maxArticles = 5) {
  try {
    const cacheKey = `detik_search_${query}`;
    if (newsCache.has(cacheKey)) {
      logger.info(`Mengambil artikel dari cache untuk query "${query}"`, { timestamp: new Date().toISOString() });
      return newsCache.get(cacheKey);
    }

    const url = `https://www.detik.com/search/searchall?query=${encodeURIComponent(query)}&sort=date&page=1&size=${maxArticles}`;
    logger.info(`Memulai scraping dari ${url}`, { timestamp: new Date().toISOString() });

    const scrapeFunction = async () => {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2' });

      // Tunggu selector yang tepat (sesuaikan dengan struktur HTML terbaru situs)
      await page.waitForSelector('div.list-content article.list-content__item', { timeout: 5000 });

      const articles = await page.evaluate(() => {
        const items = document.querySelectorAll('div.list-content article.list-content__item');
        const scrapedArticles = [];
        items.forEach(item => {
          const linkElement = item.querySelector('h3.media__title > a.media__link');
          const titleElement = item.querySelector('h3.media__title > a.media__link');
          const sourceElement = item.querySelector('h2.media__subtitle');
          const dateElement = item.querySelector('div.media__date > span');
          const descriptionElement = item.querySelector('div.media__desc');

          const title = titleElement ? titleElement.innerText.trim() : '';
          const link = linkElement ? linkElement.href : '';
          const source = sourceElement ? sourceElement.innerText.trim() : '';
          const publishedAt = dateElement ? dateElement.innerText.trim() : '';
          const description = descriptionElement ? descriptionElement.innerText.trim() : '';

          if (title && description && link) {
            scrapedArticles.push({
              title,
              description,
              url: link.startsWith('http') ? link : `https://www.detik.com${link}`,
              source,
              publishedAt,
            });
          }
        });
        return scrapedArticles;
      });

      await browser.close();
      return articles.slice(0, maxArticles); // Membatasi jumlah artikel
    };

    const articles = await limiter.schedule(scrapeFunction);

    logger.info(`Berhasil scraping ${articles.length} artikel untuk query "${query}"`, { timestamp: new Date().toISOString() });

    // Simpan ke cache
    newsCache.set(cacheKey, articles);
    logger.info(`Artikel disimpan ke cache dengan key: "${cacheKey}"`, { timestamp: new Date().toISOString() });

    return articles;
  } catch (error) {
    logger.error(`Error dalam scraping Detik Search untuk query "${query}": ${error.message}`, {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack,
      },
    });

    return [];
  }
}
