import { BLOG_POSTS as PART1 } from "./blog-posts-data-part1.mjs";
import { BLOG_POSTS_PART2 as PART2 } from "./blog-posts-data-part2.mjs";
import { BLOG_POSTS_PART3 as PART3 } from "./blog-posts-data-part3.mjs";

/** @type {typeof PART1} */
export const BLOG_POSTS = [...PART1, ...PART2, ...PART3];
