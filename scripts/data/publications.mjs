export const publications = [
  {
    type: "Chapter",
    title: "反応選択性を支配する三次元電子場解析",
    authors: ["Daimon Sakaguchi", "Hiroaki Gotoh"],
    datePublished: "2026-07-31",
    url: "https://www.gijutu.co.jp/doc/b_2365.htm",
    isbn: "978-4-86798-162-7",
  },
  {
    type: "ScholarlyArticle",
    title: "Kinetics-Based Framework for Predicting Site- and Facial-Selectivity in Ketone Reductions",
    authors: ["Daimon Sakaguchi", "Taisei Kawasaki", "Mayu Itakura", "Chihiro Tada", "Hiroaki Gotoh"],
    datePublished: "2026",
    url: "https://doi.org/10.26434/chemrxiv.15002906/v1",
    doi: "10.26434/chemrxiv.15002906/v1",
  },
  {
    type: "ScholarlyArticle",
    title: "Predicting Substrate Reactivity in Oxidative Homocoupling of Phenols Using Positive and Unlabeled Machine Learning",
    authors: ["Takafumi Nishii", "Kaname Ichizawa", "Haruka Nagano", "Hiroya Mukai", "Daimon Sakaguchi", "Hiroaki Gotoh"],
    datePublished: "2025",
    url: "https://doi.org/10.1021/acsomega.5c05523",
    doi: "10.1021/acsomega.5c05523",
  },
  {
    type: "ScholarlyArticle",
    title: "Analysis of Asymmetric Reduction of Ketones Using Three-Dimensional Electronic States",
    authors: ["Daimon Sakaguchi", "Masaki Shimono", "Hiroaki Gotoh"],
    datePublished: "2025",
    url: "https://doi.org/10.1021/acs.jpca.5c03510",
    doi: "10.1021/acs.jpca.5c03510",
  },
  {
    type: "ScholarlyArticle",
    title: "Using Three-Dimensional Information to Predict and Interpret the Facial Selectivities of Nucleophilic Additions to Cyclic Ketones",
    authors: ["Daimon Sakaguchi", "Hiroaki Gotoh"],
    datePublished: "2024",
    url: "https://doi.org/10.1021/acs.jcim.4c00101",
    doi: "10.1021/acs.jcim.4c00101",
  },
  {
    type: "ScholarlyArticle",
    title: "立体電子状態の定量評価による求核反応の面選択性の起源の解明",
    authors: ["Daimon Sakaguchi", "Hiroaki Gotoh"],
    datePublished: "2025",
    url: "https://doi.org/10.2477/jccj.2024-0043",
    doi: "10.2477/jccj.2024-0043",
  },
];

export const publicationJsonLd = publications.map((publication) => ({
  "@type": publication.type,
  headline: publication.title,
  datePublished: publication.datePublished,
  url: publication.url,
  ...(publication.doi ? { identifier: `https://doi.org/${publication.doi}` } : {}),
  ...(publication.isbn ? { isbn: publication.isbn } : {}),
  author: publication.authors.map((name) => ({
    "@type": "Person",
    name,
    ...(name === "Daimon Sakaguchi" ? { "@id": "https://saka-d.github.io/homepage/#person" } : {}),
  })),
}));
