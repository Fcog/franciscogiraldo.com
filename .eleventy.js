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
         * Post's Next Prev links configuration.
         * 
         * Adds the previous and next links of posts on a current post.
         */
        for (let i = 0; i < posts_collection.length ; i++) {
          const prevPost = posts_collection[i - 1];
          const nextPost = posts_collection[i + 1];
      
          posts_collection[i].data["prevPost"] = prevPost;
          posts_collection[i].data["nextPost"] = nextPost;
        }

        /**
         * Post's draft status configuration.
         * 
         * Any post with the draft status will be removed from the collection.
         */
        const publishedPosts = (post) => post.data.status !== 'draft';
      
        return posts_collection.filter(publishedPosts);
    });

    return {
        dir: {
            input: "src",
            output: "dist",
        }
    }
}