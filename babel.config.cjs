// babel.config.cjs
module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          node: "current", // Menargetkan versi Node saat ini
        },
        modules: "auto", // Biarkan Babel mengatur modul sesuai kebutuhan
      },
    ],
  ],
};
