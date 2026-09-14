const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withIosFmtWorkaround(config) {
  return withDangerousMod(config, [
    'ios',
    async (config) => {
      const file = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      if (fs.existsSync(file)) {
        let contents = fs.readFileSync(file, 'utf8');
        
        // Disable Firebase SPM (required for React Native Firebase v26+ with use_frameworks! static linkage)
        if (!contents.includes('$RNFirebaseDisableSPM = true')) {
          contents = `$RNFirebaseDisableSPM = true\n` + contents;
        }

        // Remove global use_modular_headers! if present to prevent react_runtime module redefinition (DEFINES_MODULE conflict)
        contents = contents.replace(/^use_modular_headers!\n?/m, '');

        // Inject selective modular headers for Firebase/Google pods inside target block
        const firebaseModularHeaders = `
  pod 'GoogleUtilities', :modular_headers => true
  pod 'FirebaseCoreInternal', :modular_headers => true
  pod 'FirebaseCore', :modular_headers => true
  pod 'FirebaseAppCheckInterop', :modular_headers => true
  pod 'FirebaseCoreExtension', :modular_headers => true
`;

        if (!contents.includes("pod 'GoogleUtilities'")) {
          contents = contents.replace(
            /use_expo_modules!/g,
            `use_expo_modules!\n${firebaseModularHeaders}`
          );
        }

        // Remove old injected workaround if it exists at the top
        contents = contents.replace(
          /  # WORKAROUND FOR XCODE 16 \/ XCODE 26 FMT CONSTEVAL BUG[\s\S]*?(?=    react_native_post_install)/m,
          ''
        );

        const workaround = `
    # WORKAROUND FOR XCODE 16 / XCODE 26 FMT CONSTEVAL BUG
    installer.pods_project.targets.each do |target|
      if target.name == 'fmt'
        target.build_configurations.each do |config|
          config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end
`;
        
        if (!contents.includes("CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'")) {
          contents = contents.replace(
            /react_native_post_install\([\s\S]*?\)/,
            (match) => `${match}\n${workaround}`
          );
        }
        
        fs.writeFileSync(file, contents);
      }
      return config;
    },
  ]);
};
