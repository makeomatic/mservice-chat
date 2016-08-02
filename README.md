# MService Chat

[![npm version](https://badge.fury.io/js/mservice-chat.svg)](https://badge.fury.io/js/mservice-chat)
[![Build Status](https://semaphoreci.com/api/v1/makeomatic/mservice-chat/branches/master/shields_badge.svg)](https://semaphoreci.com/makeomatic/mservice-chat)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## API

See `/docs` for available endpoints.

## API requests

See `mservice` for more details about making requests

* `HTTP`

```bash
curl -H "Content-Type: application/json" -X POST -d '{"foo":"bar"}' http://localhost:3000/api/chat/rooms/list
```
  
* `socket.io`

```js
socketClient.emit('action', { action: 'api.chat.rooms.join', id: 'room-id'}, callback)
```

## Auth

* `HTTP`
Add token to request params
```bash
curl -H "Content-Type: application/json" -X POST -d '{"token":"user-token"}' http://localhost:3000/api/chat/rooms/list
```

* `socket.io`

```js
const client = SocketIOClient('http://0.0.0.0:3000', {query: 'token=user-token'});
```
