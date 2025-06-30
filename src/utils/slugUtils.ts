
export const slugify = (text: string): string => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
};

export const deslugify = (slug: string): string => {
  if (!slug) return '';
  
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
