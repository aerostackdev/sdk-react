# Authentication

## Overview

User authentication and management

### Available Operations

* [auth_signin](#auth_signin) - Sign in user
* [auth_signup](#auth_signup) - Sign up new user

## auth_signin

Sign in user

### Example Usage

<!-- UsageSnippet language="python" operationID="authSignin" method="post" path="/auth/signin" -->
```python
from aerostack import SDK


with SDK(
    api_key_auth="<YOUR_API_KEY_HERE>",
) as sdk:

    res = sdk.authentication.auth_signin(request={
        "email": "Tina.Buckridge@yahoo.com",
        "password": "nIQ75VVtUTq8bO4",
    })

    # Handle response
    print(res)

```

### Parameters

| Parameter                                                             | Type                                                                  | Required                                                              | Description                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `request`                                                             | [models.AuthSigninRequestBody](../../models/authsigninrequestbody.md) | :heavy_check_mark:                                                    | The request object to use for the request.                            |
| `retries`                                                             | [Optional[utils.RetryConfig]](../../models/utils/retryconfig.md)      | :heavy_minus_sign:                                                    | Configuration to override the default retry behavior of the client.   |

### Response

**[models.AuthResponse](../../models/authresponse.md)**

### Errors

| Error Type           | Status Code          | Content Type         |
| -------------------- | -------------------- | -------------------- |
| errors.ErrorResponse | 401                  | application/json     |
| errors.SDKError      | 4XX, 5XX             | \*/\*                |

## auth_signup

Sign up new user

### Example Usage

<!-- UsageSnippet language="python" operationID="authSignup" method="post" path="/auth/signup" -->
```python
from aerostack import SDK


with SDK(
    api_key_auth="<YOUR_API_KEY_HERE>",
) as sdk:

    res = sdk.authentication.auth_signup(request={
        "email": "user@example.com",
        "name": "John Doe",
        "password": "SecurePass123!",
    })

    # Handle response
    print(res)

```

### Parameters

| Parameter                                                             | Type                                                                  | Required                                                              | Description                                                           |
| --------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------------------------------------- |
| `request`                                                             | [models.AuthSignupRequestBody](../../models/authsignuprequestbody.md) | :heavy_check_mark:                                                    | The request object to use for the request.                            |
| `retries`                                                             | [Optional[utils.RetryConfig]](../../models/utils/retryconfig.md)      | :heavy_minus_sign:                                                    | Configuration to override the default retry behavior of the client.   |

### Response

**[models.AuthResponse](../../models/authresponse.md)**

### Errors

| Error Type           | Status Code          | Content Type         |
| -------------------- | -------------------- | -------------------- |
| errors.ErrorResponse | 400, 409             | application/json     |
| errors.SDKError      | 4XX, 5XX             | \*/\*                |