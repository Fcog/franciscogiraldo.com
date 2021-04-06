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
      
        for (let i = 0; i < posts_collection.length ; i++) {
          const prevPost = posts_collection[i - 1];
          const nextPost = posts_collection[i + 1];
      
          posts_collection[i].data["prevPost"] = prevPost;
          posts_collection[i].data["nextPost"] = nextPost;
        }
      
        return posts_collection;
    });

    return {
        dir: {
            input: "src",
            output: "dist",
        }
    }
}