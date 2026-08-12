// EvoCRM's vascaino_core agent (evo-processor/standard_runner.py) writes
// private-note content as raw HTML instead of the Markdown Chatwoot's
// message renderer expects (see MarkdownBubble.tsx). Convert the small set
// of tags that agent actually emits (br/strong/a/p/ul/li) to Markdown so
// notes render instead of showing raw tags.
export const looksLikeHtml = (content: string): boolean => /<\/?[a-z][\s\S]*?>/i.test(content);

export const htmlToMarkdown = (content: string): string => {
  return content
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<strong>(.*?)<\/strong>/gis, '**$1**')
    .replace(/<a\s+href="([^"]*)"[^>]*>(.*?)<\/a>/gis, '[$2]($1)')
    .replace(/<li>(.*?)<\/li>/gis, '- $1\n')
    .replace(/<\/(p|ul)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim();
};
