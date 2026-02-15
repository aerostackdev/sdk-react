# undefined

Developer-friendly & type-safe Go SDK specifically catered to leverage *undefined* API.

[![License: MIT](https://img.shields.io/badge/LICENSE_//_MIT-3b5bdb?style=for-the-badge&labelColor=eff6ff)](https://opensource.org/licenses/MIT)

<br /><br />
> [!IMPORTANT]

<!-- Start Summary [summary] -->
## Summary

Aerostack API: Aerostack Platform API - Unified access to database, authentication, 
caching, queues, storage, and AI services.
<!-- End Summary [summary] -->

<!-- Start Table of Contents [toc] -->
## Table of Contents
<!-- $toc-max-depth=2 -->
* [undefined](#undefined)
  * [SDK Installation](#sdk-installation)
  * [SDK Example Usage](#sdk-example-usage)
  * [Authentication](#authentication)
  * [Available Resources and Operations](#available-resources-and-operations)
  * [Retries](#retries)
  * [Error Handling](#error-handling)
  * [Server Selection](#server-selection)
  * [Custom HTTP Client](#custom-http-client)
* [Development](#development)
  * [Maturity](#maturity)
  * [Contributions](#contributions)

<!-- End Table of Contents [toc] -->

<!-- Start SDK Installation [installation] -->
## SDK Installation

To add the SDK as a dependency to your project:
```bash
go get undefined
```
<!-- End SDK Installation [installation] -->

<!-- Start SDK Example Usage [usage] -->
## SDK Example Usage

### Example

```go
package main

import (
	"context"
	"log"
	"undefined"
	"undefined/pkg/models/operations"
	"undefined/pkg/models/shared"
)

func main() {
	ctx := context.Background()

	s := undefined.New(
		undefined.WithSecurity(shared.Security{
			APIKeyAuth: "<YOUR_API_KEY_HERE>",
		}),
	)

	res, err := s.Ai.AiChat(ctx, operations.AiChatRequestBody{
		Messages: []operations.Messages{
			operations.Messages{},
		},
		Model: undefined.Pointer("@cf/meta/llama-3-8b-instruct"),
	})
	if err != nil {
		log.Fatal(err)
	}
	if res.Object != nil {
		// handle response
	}
}

```
<!-- End SDK Example Usage [usage] -->

<!-- Start Authentication [security] -->
## Authentication

### Per-Client Security Schemes

This SDK supports the following security scheme globally:

| Name         | Type   | Scheme  |
| ------------ | ------ | ------- |
| `APIKeyAuth` | apiKey | API key |

You can configure it using the `WithSecurity` option when initializing the SDK client instance. For example:
```go
package main

import (
	"context"
	"log"
	"undefined"
	"undefined/pkg/models/operations"
	"undefined/pkg/models/shared"
)

func main() {
	ctx := context.Background()

	s := undefined.New(
		undefined.WithSecurity(shared.Security{
			APIKeyAuth: "<YOUR_API_KEY_HERE>",
		}),
	)

	res, err := s.Ai.AiChat(ctx, operations.AiChatRequestBody{
		Messages: []operations.Messages{
			operations.Messages{},
		},
		Model: undefined.Pointer("@cf/meta/llama-3-8b-instruct"),
	})
	if err != nil {
		log.Fatal(err)
	}
	if res.Object != nil {
		// handle response
	}
}

```
<!-- End Authentication [security] -->

<!-- Start Available Resources and Operations [operations] -->
## Available Resources and Operations

<details open>
<summary>Available methods</summary>

### [Ai](docs/sdks/ai/README.md)

* [AiChat](docs/sdks/ai/README.md#aichat) - Generate AI chat completion

### [Authentication](docs/sdks/authentication/README.md)

* [AuthSignin](docs/sdks/authentication/README.md#authsignin) - Sign in user
* [AuthSignup](docs/sdks/authentication/README.md#authsignup) - Sign up new user

### [Cache](docs/sdks/cache/README.md)

* [CacheGet](docs/sdks/cache/README.md#cacheget) - Get cached value
* [CacheSet](docs/sdks/cache/README.md#cacheset) - Set cached value

### [Database](docs/sdks/database/README.md)

* [DbQuery](docs/sdks/database/README.md#dbquery) - Execute SQL query

### [Queue](docs/sdks/queue/README.md)

* [QueueEnqueue](docs/sdks/queue/README.md#queueenqueue) - Add job to queue

### [Services](docs/sdks/services/README.md)

* [ServicesInvoke](docs/sdks/services/README.md#servicesinvoke) - Invoke another service

### [Storage](docs/sdks/storage/README.md)

* [StorageUpload](docs/sdks/storage/README.md#storageupload) - Upload file to storage

</details>
<!-- End Available Resources and Operations [operations] -->

<!-- Start Retries [retries] -->
## Retries

Some of the endpoints in this SDK support retries. If you use the SDK without any configuration, it will fall back to the default retry strategy provided by the API. However, the default retry strategy can be overridden on a per-operation basis, or across the entire SDK.

To change the default retry strategy for a single API call, simply provide a `retry.Config` object to the call by using the `WithRetries` option:
```go
package main

import (
	"context"
	"log"
	"pkg/models/operations"
	"undefined"
	"undefined/pkg/models/operations"
	"undefined/pkg/models/shared"
	"undefined/pkg/retry"
)

func main() {
	ctx := context.Background()

	s := undefined.New(
		undefined.WithSecurity(shared.Security{
			APIKeyAuth: "<YOUR_API_KEY_HERE>",
		}),
	)

	res, err := s.Ai.AiChat(ctx, operations.AiChatRequestBody{
		Messages: []operations.Messages{
			operations.Messages{},
		},
		Model: undefined.Pointer("@cf/meta/llama-3-8b-instruct"),
	}, operations.WithRetries(
		retry.Config{
			Strategy: "backoff",
			Backoff: &retry.BackoffStrategy{
				InitialInterval: 1,
				MaxInterval:     50,
				Exponent:        1.1,
				MaxElapsedTime:  100,
			},
			RetryConnectionErrors: false,
		}))
	if err != nil {
		log.Fatal(err)
	}
	if res.Object != nil {
		// handle response
	}
}

```

If you'd like to override the default retry strategy for all operations that support retries, you can use the `WithRetryConfig` option at SDK initialization:
```go
package main

import (
	"context"
	"log"
	"undefined"
	"undefined/pkg/models/operations"
	"undefined/pkg/models/shared"
	"undefined/pkg/retry"
)

func main() {
	ctx := context.Background()

	s := undefined.New(
		undefined.WithRetryConfig(
			retry.Config{
				Strategy: "backoff",
				Backoff: &retry.BackoffStrategy{
					InitialInterval: 1,
					MaxInterval:     50,
					Exponent:        1.1,
					MaxElapsedTime:  100,
				},
				RetryConnectionErrors: false,
			}),
		undefined.WithSecurity(shared.Security{
			APIKeyAuth: "<YOUR_API_KEY_HERE>",
		}),
	)

	res, err := s.Ai.AiChat(ctx, operations.AiChatRequestBody{
		Messages: []operations.Messages{
			operations.Messages{},
		},
		Model: undefined.Pointer("@cf/meta/llama-3-8b-instruct"),
	})
	if err != nil {
		log.Fatal(err)
	}
	if res.Object != nil {
		// handle response
	}
}

```
<!-- End Retries [retries] -->

<!-- Start Error Handling [errors] -->
## Error Handling

Handling errors in this SDK should largely match your expectations. All operations return a response object or an error, they will never return both.

By Default, an API error will return `sdkerrors.SDKError`. When custom error responses are specified for an operation, the SDK may also return their associated error. You can refer to respective *Errors* tables in SDK docs for more details on possible error types for each operation.

For example, the `AuthSignin` function may return the following errors:

| Error Type              | Status Code | Content Type     |
| ----------------------- | ----------- | ---------------- |
| sdkerrors.ErrorResponse | 401         | application/json |
| sdkerrors.SDKError      | 4XX, 5XX    | \*/\*            |

### Example

```go
package main

import (
	"context"
	"errors"
	"log"
	"undefined"
	"undefined/pkg/models/operations"
	"undefined/pkg/models/sdkerrors"
	"undefined/pkg/models/shared"
)

func main() {
	ctx := context.Background()

	s := undefined.New(
		undefined.WithSecurity(shared.Security{
			APIKeyAuth: "<YOUR_API_KEY_HERE>",
		}),
	)

	res, err := s.Authentication.AuthSignin(ctx, operations.AuthSigninRequestBody{
		Email:    "Tina.Buckridge@yahoo.com",
		Password: "nIQ75VVtUTq8bO4",
	})
	if err != nil {

		var e *sdkerrors.ErrorResponse
		if errors.As(err, &e) {
			// handle error
			log.Fatal(e.Error())
		}

		var e *sdkerrors.SDKError
		if errors.As(err, &e) {
			// handle error
			log.Fatal(e.Error())
		}
	}
}

```
<!-- End Error Handling [errors] -->

<!-- Start Server Selection [server] -->
## Server Selection

### Select Server by Index

You can override the default server globally using the `WithServerIndex(serverIndex int)` option when initializing the SDK client instance. The selected server will then be used as the default on the operations that use it. This table lists the indexes associated with the available servers:

| #   | Server                        | Description       |
| --- | ----------------------------- | ----------------- |
| 0   | `https://api.aerostack.ai/v1` | Production        |
| 1   | `http://localhost:8787/v1`    | Local Development |

#### Example

```go
package main

import (
	"context"
	"log"
	"undefined"
	"undefined/pkg/models/operations"
	"undefined/pkg/models/shared"
)

func main() {
	ctx := context.Background()

	s := undefined.New(
		undefined.WithServerIndex(0),
		undefined.WithSecurity(shared.Security{
			APIKeyAuth: "<YOUR_API_KEY_HERE>",
		}),
	)

	res, err := s.Ai.AiChat(ctx, operations.AiChatRequestBody{
		Messages: []operations.Messages{
			operations.Messages{},
		},
		Model: undefined.Pointer("@cf/meta/llama-3-8b-instruct"),
	})
	if err != nil {
		log.Fatal(err)
	}
	if res.Object != nil {
		// handle response
	}
}

```

### Override Server URL Per-Client

The default server can also be overridden globally using the `WithServerURL(serverURL string)` option when initializing the SDK client instance. For example:
```go
package main

import (
	"context"
	"log"
	"undefined"
	"undefined/pkg/models/operations"
	"undefined/pkg/models/shared"
)

func main() {
	ctx := context.Background()

	s := undefined.New(
		undefined.WithServerURL("http://localhost:8787/v1"),
		undefined.WithSecurity(shared.Security{
			APIKeyAuth: "<YOUR_API_KEY_HERE>",
		}),
	)

	res, err := s.Ai.AiChat(ctx, operations.AiChatRequestBody{
		Messages: []operations.Messages{
			operations.Messages{},
		},
		Model: undefined.Pointer("@cf/meta/llama-3-8b-instruct"),
	})
	if err != nil {
		log.Fatal(err)
	}
	if res.Object != nil {
		// handle response
	}
}

```
<!-- End Server Selection [server] -->

<!-- Start Custom HTTP Client [http-client] -->
## Custom HTTP Client

The Go SDK makes API calls that wrap an internal HTTP client. The requirements for the HTTP client are very simple. It must match this interface:

```go
type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}
```

The built-in `net/http` client satisfies this interface and a default client based on the built-in is provided by default. To replace this default with a client of your own, you can implement this interface yourself or provide your own client configured as desired. Here's a simple example, which adds a client with a 30 second timeout.

```go
import (
	"net/http"
	"time"

	"undefined"
)

var (
	httpClient = &http.Client{Timeout: 30 * time.Second}
	sdkClient  = undefined.New(undefined.WithClient(httpClient))
)
```

This can be a convenient way to configure timeouts, cookies, proxies, custom headers, and other low-level configuration.
<!-- End Custom HTTP Client [http-client] -->

# Development

## Maturity

This SDK is in beta, and there may be breaking changes between versions without a major version update. Therefore, we recommend pinning usage
to a specific package version. This way, you can install the same version each time without breaking changes unless you are intentionally
looking for the latest version.

## Contributions

While we value open-source contributions to this SDK, this library is generated programmatically. Any manual changes added to internal files will be overwritten on the next generation. 
We look forward to hearing your feedback. Feel free to open a PR or an issue with a proof of concept and we'll do our best to include it in a future release. 

