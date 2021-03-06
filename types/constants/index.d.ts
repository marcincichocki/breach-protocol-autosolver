/** Date of last commit. */
declare const GIT_COMMIT_DATE: string;

/** Hash of last commit. */
declare const GIT_COMMIT_SHA: string;

/** Version from npm config. */
declare const VERSION: string;

/** Homepage url from npm config. */
declare const HOMEPAGE_URL: string;

/** Issue tracker url form npm config. */
declare const BUGS_URL: string;

/** Product name from npm config. */
declare const PRODUCT_NAME: string;

/** Platform code from builded on. */
declare const BUILD_PLATFORM: NodeJS.Platform;

/** Application ID, Windows only. */
declare const APP_ID: string;

declare const api: import('@/electron/renderer/preload').PreloadApi;
