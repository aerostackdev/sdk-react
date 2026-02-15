# Queue

## Overview

Background job queue

### Available Operations

* [queue_enqueue](#queue_enqueue) - Add job to queue

## queue_enqueue

Add job to queue

### Example Usage

<!-- UsageSnippet language="python" operationID="queueEnqueue" method="post" path="/queue/enqueue" -->
```python
from aerostack import SDK


with SDK(
    api_key_auth="<YOUR_API_KEY_HERE>",
) as sdk:

    res = sdk.queue.queue_enqueue(request={
        "data": {
            "key": "<value>",
        },
        "delay": 60,
        "type": "send-email",
    })

    # Handle response
    print(res)

```

### Parameters

| Parameter                                                                 | Type                                                                      | Required                                                                  | Description                                                               |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `request`                                                                 | [models.QueueEnqueueRequestBody](../../models/queueenqueuerequestbody.md) | :heavy_check_mark:                                                        | The request object to use for the request.                                |
| `retries`                                                                 | [Optional[utils.RetryConfig]](../../models/utils/retryconfig.md)          | :heavy_minus_sign:                                                        | Configuration to override the default retry behavior of the client.       |

### Response

**[models.QueueEnqueueResponseBody](../../models/queueenqueueresponsebody.md)**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.SDKError | 4XX, 5XX        | \*/\*           |