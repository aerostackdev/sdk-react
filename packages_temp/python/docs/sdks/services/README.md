# Services

## Overview

Cross-service invocation

### Available Operations

* [services_invoke](#services_invoke) - Invoke another service

## services_invoke

Invoke another service

### Example Usage

<!-- UsageSnippet language="python" operationID="servicesInvoke" method="post" path="/services/invoke" -->
```python
from aerostack import SDK


with SDK(
    api_key_auth="<YOUR_API_KEY_HERE>",
) as sdk:

    res = sdk.services.services_invoke(request={
        "data": {
            "key": "<value>",
            "key1": "<value>",
        },
        "service_name": "billing-webhook",
    })

    # Handle response
    print(res)

```

### Parameters

| Parameter                                                                     | Type                                                                          | Required                                                                      | Description                                                                   |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `request`                                                                     | [models.ServicesInvokeRequestBody](../../models/servicesinvokerequestbody.md) | :heavy_check_mark:                                                            | The request object to use for the request.                                    |
| `retries`                                                                     | [Optional[utils.RetryConfig]](../../models/utils/retryconfig.md)              | :heavy_minus_sign:                                                            | Configuration to override the default retry behavior of the client.           |

### Response

**[models.ServicesInvokeResponseBody](../../models/servicesinvokeresponsebody.md)**

### Errors

| Error Type      | Status Code     | Content Type    |
| --------------- | --------------- | --------------- |
| errors.SDKError | 4XX, 5XX        | \*/\*           |