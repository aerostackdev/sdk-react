<!-- Start SDK Example Usage [usage] -->
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