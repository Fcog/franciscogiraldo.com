const MOST_USED_TAG_MIN_COUNT = 2;
const MOST_USED_TAG_LIMIT = 6;

function tagSlug(tag) {
    return String(tag)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function publishedPosts(collection) {
    return collection.getFilteredByTag("post").filter((post) => post.data.status !== "draft");
}

module.exports = (config) => {
    config.addPassthroughCopy({"src/assets": "assets"})
    config.setTemplateFormats(["jpg", "png", "webp", "md", "njk"]);
    config.setBrowserSyncConfig({
        files: ["dist/**/*"],
        open: true,
    });
    config.setDataDeepMerge(true);

    let markdownIt = require("markdown-it");
    let markdownItEmoji = require("markdown-it-emoji");
    let options = {
        html: true
    };
    let markdownLib = markdownIt(options)
    config.setLibrary("md", markdownLib);

    config.addFilter("tagClasses", (tags) => {
        if (!Array.isArray(tags)) {
            return "";
        }

        return [...new Set(tags.map(tagSlug).filter(Boolean))].join(" ");
    });

    /**
     * Tags that appear on the most posts, used as the blog index filters.
     * Spellings that differ only by case are grouped together.
     */
    config.addCollection("postTags", (collection) => {
        const counts = new Map();

        for (const post of publishedPosts(collection)) {
            const seen = new Set();

            for (const tag of post.data.post_tags || []) {
                const slug = tagSlug(tag);
                if (!slug || seen.has(slug)) {
                    continue;
                }
                seen.add(slug);

                const current = counts.get(slug) || { slug, count: 0, variants: new Map() };
                current.count += 1;
                current.variants.set(tag, (current.variants.get(tag) || 0) + 1);
                counts.set(slug, current);
            }
        }

        return [...counts.values()]
            .filter((tag) => tag.count >= MOST_USED_TAG_MIN_COUNT)
            .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug))
            .slice(0, MOST_USED_TAG_LIMIT)
            .map((tag) => {
                const name = [...tag.variants.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
                const label = name === name.toLowerCase()
                    ? name.charAt(0).toUpperCase() + name.slice(1)
                    : name;
                return { slug: tag.slug, name: label, count: tag.count };
            });
    });

    config.addCollection("posts", function(collection) {
        /**
         * Post's draft status configuration.
         * 
         * Any post with the draft status will be removed from the collection.
         */
        const publishedPostsList = publishedPosts(collection);
      
        /** 
         * Post's Next Prev links configuration.
         * 
         * Adds the previous and next links of posts on a current post.
         */
        for (let i = 0; i < publishedPostsList.length ; i++) {
          const prevPost = publishedPostsList[i - 1];
          const nextPost = publishedPostsList[i + 1];
      
          publishedPostsList[i].data["prevPost"] = prevPost;
          publishedPostsList[i].data["nextPost"] = nextPost;
        }
      
        return publishedPostsList;
    });

    return {
        markdownTemplateEngine: false,
        dir: {
            input: "src",
            output: "dist",
        }
    }
}