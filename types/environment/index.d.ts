declare namespace NodeJS {
  export interface ProcessEnv {
    /** Version from npm config. */
    npm_package_version: string;

    /** Homepage field from npm config. */
    npm_package_homepage: string;

    /** Issue tracker url form npm config. */
    npm_package_bugs_url: string;

    /** Product name from npm config. */
    npm_package_build_productName: string;

    /** HEAD hash. */
    GIT_COMMIT_SHA: string;

    /** Timestamp of HEAD. */
    GIT_COMMIT_DATE: string;

    /** Latest git tag. */
    GIT_TAG: string;
  }
}
