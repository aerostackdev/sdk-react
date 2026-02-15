# Authentication

## Overview

User authentication and management

### Available Operations

* [AuthSignin](#authsignin) - Sign in user
* [AuthSignup](#authsignup) - Sign up new user

## AuthSignin

Sign in user

### Example Usage

<!-- UsageSnippet language="go" operationID="authSignin" method="post" path="/auth/signin" -->
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

    res, err := s.Authentication.AuthSignin(ctx, operations.AuthSigninRequestBody{
        Email: "Tina.Buckridge@yahoo.com",
        Password: "nIQ75VVtUTq8bO4",
    })
    if err != nil {
        log.Fatal(err)
    }
    if res.AuthResponse != nil {
        // handle response
    }
}
```

### Parameters

| Parameter                                                                                | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `ctx`                                                                                    | [context.Context](https://pkg.go.dev/context#Context)                                    | :heavy_check_mark:                                                                       | The context to use for the request.                                                      |
| `request`                                                                                | [operations.AuthSigninRequestBody](../../pkg/models/operations/authsigninrequestbody.md) | :heavy_check_mark:                                                                       | The request object to use for the request.                                               |
| `opts`                                                                                   | [][operations.Option](../../pkg/models/operations/option.md)                             | :heavy_minus_sign:                                                                       | The options for this request.                                                            |

### Response

**[*operations.AuthSigninResponse](../../pkg/models/operations/authsigninresponse.md), error**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| sdkerrors.ErrorResponse | 401                     | application/json        |
| sdkerrors.SDKError      | 4XX, 5XX                | \*/\*                   |

## AuthSignup

Sign up new user

### Example Usage

<!-- UsageSnippet language="go" operationID="authSignup" method="post" path="/auth/signup" -->
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

    res, err := s.Authentication.AuthSignup(ctx, operations.AuthSignupRequestBody{
        Email: "user@example.com",
        Name: undefined.Pointer("John Doe"),
        Password: "SecurePass123!",
    })
    if err != nil {
        log.Fatal(err)
    }
    if res.AuthResponse != nil {
        // handle response
    }
}
```

### Parameters

| Parameter                                                                                | Type                                                                                     | Required                                                                                 | Description                                                                              |
| ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `ctx`                                                                                    | [context.Context](https://pkg.go.dev/context#Context)                                    | :heavy_check_mark:                                                                       | The context to use for the request.                                                      |
| `request`                                                                                | [operations.AuthSignupRequestBody](../../pkg/models/operations/authsignuprequestbody.md) | :heavy_check_mark:                                                                       | The request object to use for the request.                                               |
| `opts`                                                                                   | [][operations.Option](../../pkg/models/operations/option.md)                             | :heavy_minus_sign:                                                                       | The options for this request.                                                            |

### Response

**[*operations.AuthSignupResponse](../../pkg/models/operations/authsignupresponse.md), error**

### Errors

| Error Type              | Status Code             | Content Type            |
| ----------------------- | ----------------------- | ----------------------- |
| sdkerrors.ErrorResponse | 400, 409                | application/json        |
| sdkerrors.SDKError      | 4XX, 5XX                | \*/\*                   |