module.exports = (config) => {
    config.addPassthroughCopy({"src/assets": "assets"})
    config.setTemplateFormats(["jpg", "png", "webp", "md", "njk"]);
    config.setBrowserSyncConfig({
        files: ["dist/**/*"],
        open: true,
    });
    config.setDataDeepMerge(true);

    config.addCollection("posts", function(collection) {
        const posts_collection = collection.getFilteredByTag("post");

        /**
         * Post's draft status configuration.
         * 
         * Any post with the draft status will be removed from the collection.
         */
        const publishedPosts = posts_collection.filter( post => post.data.status !== 'draft' );
      
        /** 
         * Post's Next Prev links configuration.
         * 
         * Adds the previous and next links of posts on a current post.
         */
        for (let i = 0; i < publishedPosts.length ; i++) {
          const prevPost = publishedPosts[i - 1];
          const nextPost = publishedPosts[i + 1];
      
          publishedPosts[i].data["prevPost"] = prevPost;
          publishedPosts[i].data["nextPost"] = nextPost;
        }
      
        return publishedPosts;
    });

    return {
        dir: {
            input: "src",
            output: "dist",
        }
    }
}