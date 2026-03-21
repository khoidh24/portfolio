export { cn } from "@/lib/utils";
export { pageInLoadingAnimation, pageOutLoadingAnimation } from "./animations";

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
};
