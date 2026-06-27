/** Slug for tag URLs — matches server-side tag filter normalization. */
export function tagToSlug(tag: string) {
  return tag.trim().toLowerCase().replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
}

export function tagHref(tag: string) {
  return `/tag/${tagToSlug(tag)}`;
}
