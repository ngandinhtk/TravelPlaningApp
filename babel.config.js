// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [],
    env: {
      web: {
        plugins: [
          [
            "module-resolver",
            {
              alias: {
                "react-native-maps": "@teovilla/react-native-web-maps",
              },
            },
          ],
        ],
      },
    },
  };
};
