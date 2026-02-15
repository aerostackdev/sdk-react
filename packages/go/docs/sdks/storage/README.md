# Storage

## Overview

File storage

### Available Operations

* [StorageUpload](#storageupload) - Upload file to storage

## StorageUpload

Upload file to storage

### Example Usage

<!-- UsageSnippet language="go" operationID="storageUpload" method="post" path="/storage/upload" -->
```go
package main

import(
	"context"
	"undefined/pkg/models/shared"
	"undefined"
	"os"
	"undefined/pkg/models/operations"
	"log"
)

func main() {
    ctx := context.Background()

    s := undefined.New(
        undefined.WithSecurity(shared.Security{
            APIKeyAuth: "<YOUR_API_KEY_HERE>",
        }),
    )

    example, fileErr := os.Open("example.file")
    if fileErr != nil {
        panic(fileErr)
    }

    res, err := s.Storage.StorageUpload(ctx, operations.StorageUploadRequestBody{
        ContentType: undefined.Pointer("image/jpeg"),
        File: operations.File{
            Content: example,
            FileName: "example.file",
        },
        Key: "avatars/user-123.jpg",
    })
    if err != nil {
        log.Fatal(err)
    }
    if res.Object != nil {
        // handle response
    }
}
```

### Parameters

| Parameter                                                                                      | Type                                                                                           | Required                                                                                       | Description                                                                                    |
| ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `ctx`                                                                                          | [context.Context](https://pkg.go.dev/context#Context)                                          | :heavy_check_mark:                                                                             | The context to use for the request.                                                            |
| `request`                                                                                      | [operations.StorageUploadRequestBody](../../pkg/models/operations/storageuploadrequestbody.md) | :heavy_check_mark:                                                                             | The request object to use for the request.                                                     |
| `opts`                                                                                         | [][operations.Option](../../pkg/models/operations/option.md)                                   | :heavy_minus_sign:                                                                             | The options for this request.                                                                  |

### Response

**[*operations.StorageUploadResponse](../../pkg/models/operations/storageuploadresponse.md), error**

### Errors

| Error Type         | Status Code        | Content Type       |
| ------------------ | ------------------ | ------------------ |
| sdkerrors.SDKError | 4XX, 5XX           | \*/\*              |