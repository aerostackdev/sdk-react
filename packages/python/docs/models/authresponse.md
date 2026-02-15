# AuthResponse


## Fields

| Field                                                                | Type                                                                 | Required                                                             | Description                                                          |
| -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `expires_at`                                                         | [date](https://docs.python.org/3/library/datetime.html#date-objects) | :heavy_minus_sign:                                                   | N/A                                                                  |
| `token`                                                              | *Optional[str]*                                                      | :heavy_minus_sign:                                                   | JWT authentication token                                             |
| `user`                                                               | [Optional[models.User]](../models/user.md)                           | :heavy_minus_sign:                                                   | N/A                                                                  |