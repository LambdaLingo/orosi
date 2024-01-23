/**
 * Add data types to window.navigator for use in this file.
 * See https://www.typescriptlang.org/docs/handbook/triple-slash-directives.html#-reference-types- for more info.
 */
/// <reference types="user-agent-data-types" />

console.log(window.navigator.userAgentData); // no type error!
function testUserAgent(re: RegExp): boolean {
  if (window?.navigator == null) {
    return false;
  }
  return (
    window.navigator.userAgentData?.brands.some(
      (brand: { brand: string; version: string }) => re.test(brand.brand)
    ) || re.test(window.navigator.userAgent)
  );
}

function testPlatform(re: RegExp): boolean {
  return window?.navigator != null
    ? re.test(
        window.navigator.userAgentData?.platform || window.navigator.platform
      )
    : false;
}

export function isMac(): boolean {
  return testPlatform(/^Mac/i);
}

export function isIPhone(): boolean {
  return testPlatform(/^iPhone/i);
}

export function isIPad(): boolean {
  return (
    testPlatform(/^iPad/i) ||
    // iPadOS 13 lies and says it's a Mac, but we can distinguish by detecting touch support.
    (isMac() && navigator.maxTouchPoints > 1)
  );
}

export function isIOS(): boolean {
  return isIPhone() || isIPad();
}

export function isAppleDevice(): boolean {
  return isMac() || isIOS();
}

export function isWebKit(): boolean {
  return testUserAgent(/AppleWebKit/i) && !isChrome();
}

export function isChrome(): boolean {
  return testUserAgent(/Chrome/i);
}

export function isAndroid(): boolean {
  return testUserAgent(/Android/i);
}

export function isFirefox(): boolean {
  return testUserAgent(/Firefox/i);
}
