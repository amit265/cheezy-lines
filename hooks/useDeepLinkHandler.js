import { useEffect } from 'react';
import { Linking } from 'react-native';

export default function useDeepLinkHandler() {
  useEffect(() => {
    // Handle cold start deep links
    const getInitialLink = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          handleDeepLink(url);
        }
      } catch (err) {
        console.log("Failed to get initial url:", err);
      }
    };

    getInitialLink();

    // Handle deep links when app is in background/foreground
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = (url) => {
    // Example url: https://destyastudio.com/cheezylines?data=123
    console.log("Handling deep link:", url);
    // Parse the URL and extract parameters or paths to navigate
    // e.g. const { queryParams } = Linking.parse(url);
    // TODO: implement navigation based on parsed link
  };
}
