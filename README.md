# RadioFX Simple Chat

## API

### Requests

You **MUST** emit events in the following way

```js 
socket.emit(event, params, callback)
```
where

* `event` *([String], required)* - event name, *e.g. `'rooms.list'`*
* `params` *([String|Number|Object], required)* - event parameters, *e.g. `{"id": 1}`* 
* `callback` *([Function]), required* - function that process response data, see [Response](#response), *e.g. `function(data) { console.log(data); }`*

### Response

Use [jsonapi.org](http://jsonapi.org/) format.

#### Response example

```js
{
  meta: {
    status: 200
  },
  data: {
    id: 1,
    name: 'foo'
  }
}
```

```js
{
  meta: {
    status: 403
  }, 
  errors: [
    {
      message: "An attempt was made to perform an operation that is not permitted: rooms.delete"
      name: "NotPermittedError"
    }
  ]
}
```

#### Errors handling

Use `meta.status` and `errors` response fields to check errors.

Known errors

* `ValidationError` - returns when invalid request data
* `NotPermittedError` - returns when user has no access to an event
* `Error` - returns when something went wrong

### Events

`me` get current [User](#user) object

  * params: empty object `{}`
  * access:
      - all users
  * returns: [User](#user) object

`rooms.list` get available [Room](#room) list

  * params: empty object `{}`
  * access:
      - all users
  * returns: `array` of [Room](#room) objects

`rooms.create` create [Room](#room) object

  * params: 
      - `name` [`String`] room name
  * access:
      - `admin`
  * returns: [Room](#room) object

`rooms.delete` delete [Room](#room)

  * params: 
      - `id` [`String<uuid>`] room id
  * access:
      - room creator
  * returns: `true`

`rooms.join` join to [Room](#room)

  * params: 
      - `id` [`String<uuid>`] room id
  * access:
      - all users
      - if user already joined to the room, returns `NotPermittedError` error
  * returns: [Room](#room)
  * emits:
      - `rooms.join` event to all users in the room with following data
      ```js
      {
        data: {
          user: User,
          room: Room
        }
      }
      ```

`rooms.leave` leave a [Room](#room)

  * params: 
      - `id` [`String<uuid>`] room id
  * access:
      - all users
      - if user not in the room, returns `NotPermittedError` error
  * returns: [Room](#room)
  * emits:
      - `rooms.leave` event to all users in the room with following data
      `
      {
        data: {
          user: User,
          room: Room
        }
      }
      `

`rooms.message` send message to a [Room](#room)

  * params: 
      - `id` [`String<uuid>`] room id
      - `message` message object, should be one of following types
          - `simple` `{type: 'simple', message: 'my message'}`
  * access:
      - all users allowed to send `simple` messages
      - `admin` allowed to send messages of all types
  * returns: `true`
  * emits:
      - `rooms.leave` event to all users in the room with following data
      `
      {
        data: {
          user: User,
          message: {/* message object from request */}
        }
      }
      `
