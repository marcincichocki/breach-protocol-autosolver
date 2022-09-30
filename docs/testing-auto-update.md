## Testing auto update

Auto update is a key feature which must be thoroughly tested before deployment. Things like migrations depend on it, which makes it extremely important to ensure that users will not end up with broken applications after update.

This document describes how to test it locally.

### Install and run minio

[Minio](https://min.io/) is a s3 compatible server which can be used to host build artifacts for testing purposes.

After installation create a directory for server, and than a directory for bucket to which artifacts will be uploaded.

```bash
mkdir minio-data # Create server directory.
mkdir <YOUR_BUCKET_NAME> # Create bucket.

minio server ./minio-data # Run minio server.
```

Next go api url, log in with default credentials and change `<YOUR_BUCKET_NAME>` Access Policy to `public`. This is required for electron-updater to see the update.

### Publishing

_It is recommended to first publish latest tag as it is guaranteed to work._

> **Attention**: do not use localhost as publish endpoint, as it will case upload error.

To build and publish test release run:

```bash
AWS_ACCESS_KEY_ID=<YOUR_MINIO_USERNAME> AWS_SECRET_ACCESS_KEY=<YOUR_MINIO_PASSWORD> npm run electron:build -- --publish always --config.publish.provider=s3 --config.publish.endpoint=<YOUR_MINIO_API_URL> --config.publish.bucket=<YOUR_BUCKET_NAME>
```

After command completes you should be able to see artifacts in your bucket. Download and install it.

### Auto update

Breach protocol autosolver will now query minio server for updates, so it **critical** that minio server is running in the background during this process.

_If you checked out latest tag this is the time to return to HEAD_

You can now do necessary changes to the source code, and when you are done you **must** increase version field in `package.json`. You can also attach test release notes by adding `release-notes.md` file to `resources` folder.

Now, the only thing left is to run publish command again.

### Final result

If everything went smooth, when you run breach protocol autosolver you should be greeted with update available dialog.
