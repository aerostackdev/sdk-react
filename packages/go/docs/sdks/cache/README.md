# Cache

## Overview

Key-value caching

### Available Operations

* [CacheGet](#cacheget) - Get cached value
* [CacheSet](#cacheset) - Set cached value

## CacheGet

Get cached value

### Example Usage

<!-- UsageSnippet language="go" operationID="cacheGet" method="post" path="/cache/get" -->
```go
package main

import(
	"context"
	"undefined/pkg/models/shared"
	"undefined"
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

    res, err := s.Cache.CacheGet(ctx, operations.CacheGetRequestBody{
        Key: "user:123:profile",
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

| Parameter                                                                            | Type                                                                                 | Required                                                                             | Description                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `ctx`                                                                                | [context.Context](https://pkg.go.dev/context#Context)                                | :heavy_check_mark:                                                                   | The context to use for the request.                                                  |
| `request`                                                                            | [operations.CacheGetRequestBody](../../pkg/models/operations/cachegetrequestbody.md) | :heavy_check_mark:                                                                   | The request object to use for the request.                                           |
| `opts`                                                                               | [][operations.Option](../../pkg/models/operations/option.md)                         | :heavy_minus_sign:                                                                   | The options for this request.                                                        |

### Response

**[*operations.CacheGetResponse](../../pkg/models/operations/cachegetresponse.md), error**

### Errors

| Error Type         | Status Code        | Content Type       |
| ------------------ | ------------------ | ------------------ |
| sdkerrors.SDKError | 4XX, 5XX           | \*/\*              |

## CacheSet

Set cached value

### Example Usage

<!-- UsageSnippet language="go" operationID="cacheSet" method="post" path="/cache/set" -->
```go
package main

import(
	"context"
	"undefined/pkg/models/shared"
	"undefined"
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

    res, err := s.Cache.CacheSet(ctx, operations.CacheSetRequestBody{
        Key: "<key>",
        TTL: undefined.Pointer[int64](3600),
        Value: "<value>",
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

| Parameter                                                                            | Type                                                                                 | Required                                                                             | Description                                                                          |
| ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `ctx`                                                                                | [context.Context](https://pkg.go.dev/context#Context)                                | :heavy_check_mark:                                                                   | The context to use for the request.                                                  |
| `request`                                                                            | [operations.CacheSetRequestBody](../../pkg/models/operations/cachesetrequestbody.md) | :heavy_check_mark:                                                                   | The request object to use for the request.                                           |
| `opts`                                                                               | [][operations.Option](../../pkg/models/operations/option.md)                         | :heavy_minus_sign:                                                                   | The options for this request.                                                        |

### Response

**[*operations.CacheSetResponse](../../pkg/models/operations/cachesetresponse.md), error**

### Errors

| Error Type         | Status Code        | Content Type       |
| ------------------ | ------------------ | ------------------ |
| sdkerrors.SDKError | 4XX, 5XX           | \*/\*              |