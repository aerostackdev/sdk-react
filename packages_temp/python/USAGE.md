<!-- Start SDK Example Usage [usage] -->
```python
# Synchronous Example
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

</br>

The same SDK client can also be used to make asynchronous requests by importing asyncio.

```python
# Asynchronous Example
from aerostack import SDK
import asyncio

async def main():

    async with SDK(
        api_key_auth="<YOUR_API_KEY_HERE>",
    ) as sdk:

        res = await sdk.ai.ai_chat_async(request={
            "messages": [
                {},
            ],
            "model": "@cf/meta/llama-3-8b-instruct",
        })

        # Handle response
        print(res)

asyncio.run(main())
```
<!-- End SDK Example Usage [usage] -->