export enum ArticleTag {
  Frontend = "Frontend",
  Backend = "Backend",
  Design = "Design",
  WebMotion = "Web motion",
  AI = "AI",
  DSA = "DSA",
  OS = "OS",
  Deployment = "Deployment",
  Optimization = "Optimization",
  Tips = "Tips",
}

export const ARTICLE_TAG_INDEX: Record<ArticleTag, number> = {
  [ArticleTag.Frontend]: 1,
  [ArticleTag.Backend]: 2,
  [ArticleTag.Deployment]: 3,
  [ArticleTag.WebMotion]: 4,
  [ArticleTag.Design]: 5,
  [ArticleTag.AI]: 6,
  [ArticleTag.OS]: 7,
  [ArticleTag.DSA]: 8,
  [ArticleTag.Optimization]: 9,
  [ArticleTag.Tips]: 10,
};

export const ALL_ARTICLE_TAGS = Object.values(ArticleTag);
