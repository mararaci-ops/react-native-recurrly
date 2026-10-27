// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = withNativeWind(getDefaultConfig(__dirname));
const nativeWindResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const isExpoAssetModule = context.originModulePath
    .split(/[\\/]/)
    .includes("expo-asset");

  if (moduleName === "react-native" && isExpoAssetModule) {
    return context.resolveRequest(context, moduleName, platform);
  }

  return nativeWindResolveRequest(context, moduleName, platform);
};

module.exports = config;
