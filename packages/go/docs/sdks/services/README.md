# Services

## Overview

Cross-service invocation

### Available Operations

* [ServicesInvoke](#servicesinvoke) - Invoke another service

## ServicesInvoke

Invoke another service

### Example Usage

<!-- UsageSnippet language="go" operationID="servicesInvoke" method="post" path="/services/invoke" -->
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

    res, err := s.Services.ServicesInvoke(ctx, operations.ServicesInvokeRequestBody{
        Data: map[string]any{
            "key": "<value>",
            "key1": "<value>",
        },
        ServiceName: "billing-webhook",
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

| Parameter                                                                                        | Type                                                                                             | Required                                                                                         | Description                                                                                      |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `ctx`                                                                                            | [context.Context](https://pkg.go.dev/context#Context)                                            | :heavy_check_mark:                                                                               | The context to use for the request.                                                              |
| `request`                                                                                        | [operations.ServicesInvokeRequestBody](../../pkg/models/operations/servicesinvokerequestbody.md) | :heavy_check_mark:                                                                               | The request object to use for the request.                                                       |
| `opts`                                                                                           | [][operations.Option](../../pkg/models/operations/option.md)                                     | :heavy_minus_sign:                                                                               | The options for this request.                                                                    |

### Response

**[*operations.ServicesInvokeResponse](../../pkg/models/operations/servicesinvokeresponse.md), error**

### Errors

| Error Type         | Status Code        | Content Type       |
| ------------------ | ------------------ | ------------------ |
| sdkerrors.SDKError | 4XX, 5XX           | \*/\*              |