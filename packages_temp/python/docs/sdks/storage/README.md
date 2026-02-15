# Storage

## Overview

File storage

### Available Operations

* [storage_upload](#storage_upload) - Upload file to storage

## storage_upload

Upload file to storage

### Example Usage

<!-- UsageSnippet language="python" operationID="storageUpload" method="post" path="/storage/upload" -->
```python
from aerostack import SDK


with SDK(
    api_key_auth="<YOUR_API_KEY_HERE>",
) as sdk:

    res = sdk.storage.storage_upload(request={
        "content_type": "image/jpeg",
        "file": {
            "content": open("example.file", "rb"),
            "file_name": "example.file",
        },
        "key": "avatars/user-123.jpg",
    })

    # Handle response
    print(res)

```

### Parameters

| Parameter                                                                   | Type                                                                        | Required                                                                    | Description                                                                 |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `request`                                                                   | [models.StorageUploadRequestBody](../../models/storageuploadrequestbody.md) | :heavy_check_mark:                                                          | The request object to use for the request.                                  |
| `retries`                                                                   | [Optional[utils.RetryConfig]](../../models/utils/retryconfig.md)            | :heavy_minus_sign:                                                          | Configuration to override the default retry behavior of the client.         |

### Response

**[models.StorageUploadResponseBody](../../models/storageuploadresponsebody.md)**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.SDKError | 4XX, 5XX        | \*/\*           |