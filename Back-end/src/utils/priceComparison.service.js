const PLATFORM_DEFINITIONS = [
  { name: "Amazon", domains: ["amazon.in", "amazon.com"] },
  { name: "Flipkart", domains: ["flipkart.com"] },
  { name: "Myntra", domains: ["myntra.com"] },
  { name: "Blinkit", domains: ["blinkit.com"] },
  { name: "OLX", domains: ["olx.in", "olx.com"] },
  { name: "Croma", domains: ["croma.com"] },
  { name: "Reliance Digital", domains: ["reliancedigital.in"] },
  { name: "Vijay Sales", domains: ["vijaysales.com"] },
  { name: "Tata Cliq", domains: ["tatacliq.com"] },
  { name: "JioMart", domains: ["jiomart.com"] },
];

const findPlatform = (source = "", link = "") => {
  const value = `${source} ${link}`.toLowerCase();
  return PLATFORM_DEFINITIONS.find(({ name, domains }) =>
    value.includes(name.toLowerCase()) || domains.some((domain) => value.includes(domain))
  )?.name || source || "Other";
};

const asNumber = (value) => {
  if (typeof value === "number") return value;
  if (!value) return null;
  const number = Number(String(value).replace(/[^0-9.]/g, ""));
  return Number.isFinite(number) ? number : null;
};

const normalizeShoppingResult = (item) => ({
  platform: findPlatform(item.source, item.product_link || item.link),
  itemName: item.title || "Product listing",
  price: asNumber(item.extracted_price ?? item.price),
  currency: "INR",
  image: item.thumbnail || item.thumbnail_url || null,
  url: item.product_link || item.link || null,
  delivery: item.delivery || item.extensions?.find((extension) => /delivery|shipping/i.test(extension)) || null,
  rating: item.rating ?? null,
  reviews: item.reviews ?? null,
  availability: "available",
});

const extractModelTokens = (title) => {
  const clean = title.toLowerCase();
  const tokens = clean.match(/[a-z0-9]+/g) || [];
  const commonUnits = /^\d+(hz|ms|gb|tb|mah|cm|inch|w|v|db|fps|k|in|m|g|t|dpi|p|ah|v)$/i;
  const resolutionPattern = /^\d+x\d+$/i;
  const portPattern = /^\d+x[a-z]+/i;

  return tokens.filter(token => {
    const hasLetters = /[a-z]/i.test(token);
    const hasDigits = /[0-9]/.test(token);
    if (!hasLetters || !hasDigits) return false;
    if (commonUnits.test(token)) return false;
    if (resolutionPattern.test(token)) return false;
    if (portPattern.test(token)) return false;
    return token.length >= 3;
  });
};

const isSameModel = (sourceTitle, targetTitle) => {
  const sourceTokens = extractModelTokens(sourceTitle);
  if (sourceTokens.length > 0) {
    const primaryModel = sourceTokens[0];
    const cleanTarget = targetTitle.toLowerCase();
    const cleanTargetAlphanum = cleanTarget.replace(/[^a-z0-9]/g, "");
    const cleanPrimaryAlphanum = primaryModel.replace(/[^a-z0-9]/g, "");
    return cleanTargetAlphanum.includes(cleanPrimaryAlphanum);
  }

  const getSignificantWords = (t) => {
    return t.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length >= 3 && !["and", "the", "for", "with", "from", "inch", "black", "white", "gray", "silver"].includes(w));
  };

  const sourceWords = getSignificantWords(sourceTitle);
  const targetWords = getSignificantWords(targetTitle);

  if (sourceWords.length === 0) return true;

  const keyWords = sourceWords.slice(0, 3);
  const matchedCount = keyWords.filter(word => targetWords.includes(word)).length;
  return matchedCount >= Math.min(2, keyWords.length);
};

const searchLiveListings = async (query) => {
  if (!process.env.SERPAPI_KEY) return { listings: [], providerConfigured: false };

  const params = new URLSearchParams({ engine: "google_shopping", q: query, gl: "in", hl: "en", api_key: process.env.SERPAPI_KEY });
  const response = await fetch(`https://serpapi.com/search.json?${params}`);
  if (!response.ok) throw new Error("Price search provider could not be reached");

  const payload = await response.json();
  return { listings: (payload.shopping_results || []).map(normalizeShoppingResult), providerConfigured: true };
};

const buildComparison = async ({ title, price, thumbnail, productId }) => {
  const { listings: liveListings, providerConfigured } = await searchLiveListings(title);
  
  const matchedListings = liveListings.filter((listing) => isSameModel(title, listing.itemName));

  const ownListing = {
    platform: "E-2 Market", itemName: title, price: asNumber(price), currency: "INR", image: thumbnail || null,
    url: `/product_page/${productId}`, delivery: "Check delivery at checkout", rating: null, reviews: null, availability: "available",
  };
  
  const byPlatform = new Map([[ownListing.platform, ownListing]]);
  matchedListings.forEach((listing) => {
    const current = byPlatform.get(listing.platform);
    if (!current || (listing.price !== null && listing.price < current.price)) byPlatform.set(listing.platform, listing);
  });


  const listings = [...byPlatform.values()].sort((a, b) => {
    if (a.price === null) return 1;
    if (b.price === null) return -1;
    return a.price - b.price;
  });
  return { query: title, currency: "INR", comparedAt: new Date().toISOString(), providerConfigured, listings };
};

export { buildComparison };
