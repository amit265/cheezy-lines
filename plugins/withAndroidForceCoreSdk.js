const { withProjectBuildGradle } = require('expo/config-plugins');

module.exports = function withAndroidForceCoreSdk(config) {
  return withProjectBuildGradle(config, (config) => {
    const buildGradle = config.modResults.contents;
    
    if (buildGradle.includes("force 'androidx.core:core:1.15.0'")) {
      return config;
    }

    const resolutionStrategy = `
  configurations.all {
    resolutionStrategy {
      force 'androidx.core:core:1.15.0'
      force 'androidx.core:core-ktx:1.15.0'
    }
  }
`;

    config.modResults.contents = buildGradle.replace(
      /allprojects\s*\{/,
      `allprojects {${resolutionStrategy}`
    );

    return config;
  });
};
