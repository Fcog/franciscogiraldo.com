module.exports = (config) => {
    config.addPassthroughCopy({"src/assets": "assets"})
    config.setTemplateFormats(["jpg", "png", "webp", "md", "njk"]);
    config.setBrowserSyncConfig({
        files: ["dist/**/*"],
        open: true,
    });
    config.setDataDeepMerge(true);

    return {
        dir: {
            input: "src",
            output: "dist",
        }
    }
}