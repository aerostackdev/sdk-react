# Ai

## Overview

AI/ML operations

### Available Operations

* [ai_chat](#ai_chat) - Generate AI chat completion

## ai_chat

Generate AI chat completion

### Example Usage

<!-- UsageSnippet language="python" operationID="aiChat" method="post" path="/ai/chat" -->
```python
from aerostack import SDK


with SDK(
    api_key_auth="<YOUR_API_KEY_HERE>",
) as sdk:

    res = sdk.ai.ai_chat(request={
        "messages": [
            {},
        ],
        "model": "@cf/meta/llama-3-8b-instruct",
    })

    # Handle response
    print(res)

```

### Parameters

| Parameter                                                           | Type                                                                | Required                                                            | Description                                                         |
| ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `request`                                                           | [models.AiChatRequestBody](../../models/aichatrequestbody.md)       | :heavy_check_mark:                                                  | The request object to use for the request.                          |
| `retries`                                                           | [Optional[utils.RetryConfig]](../../models/utils/retryconfig.md)    | :heavy_minus_sign:                                                  | Configuration to override the default retry behavior of the client. |

### Response

**[models.AiChatResponseBody](../../models/aichatresponsebody.md)**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.SDKError | 4XX, 5XX        | \*/\*           |