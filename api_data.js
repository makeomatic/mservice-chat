define({ "api": [
  {
    "type": "socket.io",
    "url": "messages.delete.<roomId>",
    "title": "Delete a message",
    "description": "<p>Fired when somebody delete a message</p>",
    "version": "1.0.0",
    "name": "messages_delete_broadcast",
    "group": "MessagesBroadcast",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p><code>message</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"message\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>Message properties</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.text",
            "description": "<p>Message text</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "data.attributes.sanitizedText",
            "description": "<p>Message text processed by profanity filter</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.user",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.user.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.user.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.user.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": true,
            "field": "data.attributes.createdAt",
            "description": "<p>ISO Date</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.delete.js",
    "groupTitle": "MessagesBroadcast"
  },
  {
    "type": "socket.io",
    "url": "messages.edit.<roomId>",
    "title": "Edit a message",
    "description": "<p>Fired when somebody edit a message</p>",
    "version": "1.0.0",
    "name": "messages_edit_broadcast",
    "group": "MessagesBroadcast",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p><code>message</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"message\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>Message properties</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.text",
            "description": "<p>Message text</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "data.attributes.sanitizedText",
            "description": "<p>Message text processed by profanity filter</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.user",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.user.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.user.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.user.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": true,
            "field": "data.attributes.createdAt",
            "description": "<p>ISO Date</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.edit.js",
    "groupTitle": "MessagesBroadcast"
  },
  {
    "type": "socket.io",
    "url": "messages.pin.<roomId>",
    "title": "Pin a message",
    "description": "<p>Fired when somebody pin a message</p>",
    "version": "1.0.0",
    "name": "messages_pin_broadcast",
    "group": "MessagesBroadcast",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p><code>pin</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"pin\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Uuid",
            "optional": false,
            "field": "data.attributes.roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.messageId",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.message",
            "description": "<p><code>message</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"message\""
            ],
            "optional": false,
            "field": "data.attributes.message.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.message.attributes",
            "description": "<p>Message properties</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.attributes.text",
            "description": "<p>Message text</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "data.attributes.message.attributes.sanitizedText",
            "description": "<p>Message text processed by profanity filter</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.message.attributes.user",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.attributes.user.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.attributes.user.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.message.attributes.user.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": true,
            "field": "data.attributes.message.attributes.createdAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "data.attributes.pinnedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "data.attributes.unpinnedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.pinnedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.pinnedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.pinnedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.pinnedBy.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.unpinnedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.unpinnedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.unpinnedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.unpinnedBy.roles",
            "description": "<p>User roles undefined</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.pin.js",
    "groupTitle": "MessagesBroadcast"
  },
  {
    "type": "socket.io",
    "url": "messages.send.<roomId>",
    "title": "Send message to a room",
    "description": "<p>Fired when somebody sends message to a room</p>",
    "version": "1.0.0",
    "name": "messages_send_broadcast",
    "group": "MessagesBroadcast",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p><code>message</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"message\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>Message properties</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.text",
            "description": "<p>Message text</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "data.attributes.sanitizedText",
            "description": "<p>Message text processed by profanity filter</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.user",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.user.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.user.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.user.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": true,
            "field": "data.attributes.createdAt",
            "description": "<p>ISO Date</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.send.js",
    "groupTitle": "MessagesBroadcast"
  },
  {
    "type": "socket.io",
    "url": "messages.unpin.<roomId>",
    "title": "Unpin a message",
    "description": "<p>Fired when somebody unpin a message</p>",
    "version": "1.0.0",
    "name": "messages_unpin_broadcast",
    "group": "MessagesBroadcast",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>User data</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"user\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>User type</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>User attributes</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.roles",
            "description": "<p>User roles undefined</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.unpin.js",
    "groupTitle": "MessagesBroadcast"
  },
  {
    "type": "http",
    "url": "<prefix>.messages.delete",
    "title": "Delete a message",
    "version": "1.0.0",
    "name": "messages_delete",
    "group": "Messages",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Auth token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "meta",
            "description": "<p>Success metadata</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"success\""
            ],
            "optional": false,
            "field": "meta.status",
            "description": "<p>Response status</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.delete.js",
    "groupTitle": "Messages"
  },
  {
    "type": "http",
    "url": "<prefix>.messages.edit",
    "title": "Edit a message",
    "version": "1.0.0",
    "name": "messages_edit",
    "group": "Messages",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "size": "..1024",
            "optional": false,
            "field": "text",
            "description": "<p>Message text</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Auth token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "meta",
            "description": "<p>Success metadata</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"success\""
            ],
            "optional": false,
            "field": "meta.status",
            "description": "<p>Response status</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.edit.js",
    "groupTitle": "Messages"
  },
  {
    "type": "http",
    "url": "<prefix>.messages.history",
    "title": "Get messages history",
    "version": "1.0.0",
    "name": "messages_history",
    "group": "Messages",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": true,
            "field": "before",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "size": "1 - 20",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>Limitation of results</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "meta",
            "description": "<p>Collection metadata</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "meta.count",
            "description": "<p>Count of results</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "meta.before",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "meta.last",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "data",
            "description": "<p>Collection of messages <code>message</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"message\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>Message properties</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.text",
            "description": "<p>Message text</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "data.attributes.sanitizedText",
            "description": "<p>Message text processed by profanity filter</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.user",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.user.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.user.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.user.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": true,
            "field": "data.attributes.createdAt",
            "description": "<p>ISO Date</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.history.js",
    "groupTitle": "Messages"
  },
  {
    "type": "http",
    "url": "<prefix>.messages.last-pin",
    "title": "Get last pin",
    "version": "1.0.0",
    "name": "messages_last_pin",
    "group": "Messages",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "roomId",
            "description": "<p><code>room</code> identificator</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p><code>pin</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"pin\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Uuid",
            "optional": false,
            "field": "data.attributes.roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.messageId",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.message",
            "description": "<p><code>message</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"message\""
            ],
            "optional": false,
            "field": "data.attributes.message.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.message.attributes",
            "description": "<p>Message properties</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.attributes.text",
            "description": "<p>Message text</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "data.attributes.message.attributes.sanitizedText",
            "description": "<p>Message text processed by profanity filter</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.message.attributes.user",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.attributes.user.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.attributes.user.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.message.attributes.user.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": true,
            "field": "data.attributes.message.attributes.createdAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "data.attributes.pinnedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "data.attributes.unpinnedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.pinnedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.pinnedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.pinnedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.pinnedBy.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.unpinnedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.unpinnedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.unpinnedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.unpinnedBy.roles",
            "description": "<p>User roles undefined</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.last-pin.js",
    "groupTitle": "Messages"
  },
  {
    "type": "http",
    "url": "<prefix>.messages.pin",
    "title": "Pin a message",
    "version": "1.0.0",
    "name": "messages_pin",
    "group": "Messages",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Auth token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p><code>pin</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"pin\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Uuid",
            "optional": false,
            "field": "data.attributes.roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.messageId",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.message",
            "description": "<p><code>message</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"message\""
            ],
            "optional": false,
            "field": "data.attributes.message.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.message.attributes",
            "description": "<p>Message properties</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.attributes.text",
            "description": "<p>Message text</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "data.attributes.message.attributes.sanitizedText",
            "description": "<p>Message text processed by profanity filter</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.message.attributes.user",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.attributes.user.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.attributes.user.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.message.attributes.user.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": true,
            "field": "data.attributes.message.attributes.createdAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "data.attributes.pinnedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "data.attributes.unpinnedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.pinnedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.pinnedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.pinnedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.pinnedBy.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.unpinnedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.unpinnedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.unpinnedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.unpinnedBy.roles",
            "description": "<p>User roles undefined</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.pin.js",
    "groupTitle": "Messages"
  },
  {
    "type": "http",
    "url": "<prefix>.messages.pins-history",
    "title": "Get pins history",
    "version": "1.0.0",
    "name": "messages_pins_history",
    "group": "Messages",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "Date-time",
            "optional": true,
            "field": "before",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "size": "1 - 20",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>Limitation of results</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Auth token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "meta",
            "description": "<p>Collection metadata</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "meta.count",
            "description": "<p>Count of results</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "meta.before",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "meta.last",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "data",
            "description": "<p>Collection of pins <code>pin</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"pin\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Uuid",
            "optional": false,
            "field": "data.attributes.roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.messageId",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.message",
            "description": "<p><code>message</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"message\""
            ],
            "optional": false,
            "field": "data.attributes.message.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.message.attributes",
            "description": "<p>Message properties</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.attributes.text",
            "description": "<p>Message text</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "data.attributes.message.attributes.sanitizedText",
            "description": "<p>Message text processed by profanity filter</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.message.attributes.user",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.attributes.user.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.message.attributes.user.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.message.attributes.user.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": true,
            "field": "data.attributes.message.attributes.createdAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "data.attributes.pinnedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "data.attributes.unpinnedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.pinnedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.pinnedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.pinnedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.pinnedBy.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.unpinnedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.unpinnedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.unpinnedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.unpinnedBy.roles",
            "description": "<p>User roles undefined</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.pins-history.js",
    "groupTitle": "Messages"
  },
  {
    "type": "socket.io",
    "url": "<prefix>.messages.send",
    "title": "Send message to a room",
    "version": "1.0.0",
    "description": "<p>If a message of type sticky is being send the event is not fired</p>",
    "name": "messages_send",
    "group": "Messages",
    "parameter": {
      "fields": {
        "Payload": [
          {
            "group": "Payload",
            "type": "String",
            "optional": false,
            "field": "roomId",
            "description": "<ul> <li>Room identificator</li> </ul>"
          },
          {
            "group": "Payload",
            "type": "Object",
            "optional": false,
            "field": "message",
            "description": "<ul> <li>Message object</li> </ul>"
          },
          {
            "group": "Payload",
            "type": "String",
            "optional": false,
            "field": "message.text",
            "description": "<ul> <li>Text</li> </ul>"
          },
          {
            "group": "Payload",
            "type": "String",
            "optional": true,
            "field": "message.type",
            "description": "<ul> <li><code>sticky</code> if sticky message</li> </ul>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p><code>message</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"message\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>Message properties</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.text",
            "description": "<p>Message text</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "data.attributes.sanitizedText",
            "description": "<p>Message text processed by profanity filter</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.user",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.user.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.user.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.user.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": true,
            "field": "data.attributes.createdAt",
            "description": "<p>ISO Date</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.send.js",
    "groupTitle": "Messages"
  },
  {
    "type": "http",
    "url": "<prefix>.messages.unpin",
    "title": "Unpin last message",
    "version": "1.0.0",
    "name": "messages_unpin",
    "group": "Messages",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Auth token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "meta",
            "description": "<p>Success metadata</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"success\""
            ],
            "optional": false,
            "field": "meta.status",
            "description": "<p>Response status</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/messages.unpin.js",
    "groupTitle": "Messages"
  },
  {
    "type": "socket.io",
    "url": "participants.ban.<roomId>",
    "title": "Ban an user",
    "description": "<p>Fired when somebody ban an user</p>",
    "version": "1.0.0",
    "name": "participants_ban_broadcast",
    "group": "ParticipantsBroadcast",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"participant\""
            ],
            "optional": false,
            "field": "type",
            "description": "<p>Participant type</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "attributes",
            "description": "<p>Participant attributes</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "attributes.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Uuid",
            "optional": false,
            "field": "attributes.roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "attributes.bannedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "attributes.bannedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.bannedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.bannedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "attributes.bannedBy.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.reason",
            "description": "<p>Ban reason</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "attributes.joinedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "attributes.lastActivityAt",
            "description": "<p>ISO Date</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/participants.ban.js",
    "groupTitle": "ParticipantsBroadcast"
  },
  {
    "type": "socket.io",
    "url": "participants.unban.<roomId>",
    "title": "Unban an user",
    "description": "<p>Fired when somebody unban an user</p>",
    "version": "1.0.0",
    "name": "participants_unban_broadcast",
    "group": "ParticipantsBroadcast",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"participant\""
            ],
            "optional": false,
            "field": "type",
            "description": "<p>Participant type</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "attributes",
            "description": "<p>Participant attributes</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "attributes.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Uuid",
            "optional": false,
            "field": "attributes.roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "attributes.bannedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "attributes.bannedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.bannedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.bannedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "attributes.bannedBy.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.reason",
            "description": "<p>Ban reason</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "attributes.joinedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "attributes.lastActivityAt",
            "description": "<p>ISO Date</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/participants.unban.js",
    "groupTitle": "ParticipantsBroadcast"
  },
  {
    "type": "http",
    "url": "<prefix>.participants.ban",
    "title": "Ban an user",
    "version": "1.0.0",
    "name": "participants_ban",
    "group": "Participants",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "reason",
            "description": "<p>Ban reason</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Auth token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"participant\""
            ],
            "optional": false,
            "field": "type",
            "description": "<p>Participant type</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "attributes",
            "description": "<p>Participant attributes</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "attributes.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Uuid",
            "optional": false,
            "field": "attributes.roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "attributes.bannedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "attributes.bannedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.bannedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.bannedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "attributes.bannedBy.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.reason",
            "description": "<p>Ban reason</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "attributes.joinedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "attributes.lastActivityAt",
            "description": "<p>ISO Date</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/participants.ban.js",
    "groupTitle": "Participants"
  },
  {
    "type": "http",
    "url": "<prefix>.participants.list",
    "title": "Get list of participants",
    "description": "<p>Use <code>joinedAt</code> field for pagination</p>",
    "version": "1.0.0",
    "name": "participants_list",
    "group": "Participants",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": true,
            "field": "before",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Parameter",
            "type": "Integer",
            "size": "1 - 20",
            "optional": true,
            "field": "limit",
            "defaultValue": "20",
            "description": "<p>Limitation of results</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "meta",
            "description": "<p>Collection metadata</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "meta.count",
            "description": "<p>Count of results</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "meta.before",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "meta.last",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "data",
            "description": "<p>Collection of participants <code>participant</code> response</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"participant\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>Participant type</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>Participant attributes</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Uuid",
            "optional": false,
            "field": "data.attributes.roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "data.attributes.bannedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.bannedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.bannedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.bannedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.bannedBy.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.reason",
            "description": "<p>Ban reason</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "data.attributes.joinedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "data.attributes.lastActivityAt",
            "description": "<p>ISO Date</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/participants.list.js",
    "groupTitle": "Participants"
  },
  {
    "type": "http",
    "url": "<prefix>.participants.unban",
    "title": "Unban an user",
    "version": "1.0.0",
    "name": "participants_unban",
    "group": "Participants",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Auth token</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"participant\""
            ],
            "optional": false,
            "field": "type",
            "description": "<p>Participant type</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "attributes",
            "description": "<p>Participant attributes</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "attributes.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Uuid",
            "optional": false,
            "field": "attributes.roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "attributes.bannedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "attributes.bannedBy",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.bannedBy.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.bannedBy.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "attributes.bannedBy.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "attributes.reason",
            "description": "<p>Ban reason</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "attributes.joinedAt",
            "description": "<p>ISO Date</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": false,
            "field": "attributes.lastActivityAt",
            "description": "<p>ISO Date</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/participants.unban.js",
    "groupTitle": "Participants"
  },
  {
    "type": "amqp",
    "url": "<prefix>.internal.rooms.broadcast",
    "title": "Broadcast event, for internal use only",
    "version": "1.0.0",
    "name": "internal_rooms_broadcast",
    "group": "RoomInternal",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "roomId",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "event",
            "description": "<p>Name of the event</p>"
          },
          {
            "group": "Parameter",
            "type": "Object",
            "optional": false,
            "field": "message",
            "description": "<p>Message</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/internal.rooms.broadcast.js",
    "groupTitle": "RoomInternal"
  },
  {
    "type": "amqp",
    "url": "<prefix>.internal.rooms.create",
    "title": "Create a room, for internal use only",
    "version": "1.0.0",
    "name": "internal_rooms_create",
    "group": "RoomInternal",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the room</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "createdBy",
            "description": "<p>User identificator</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/internal.rooms.create.js",
    "groupTitle": "RoomInternal"
  },
  {
    "type": "socket.io",
    "url": "rooms.join.<roomId>",
    "title": "Join a room",
    "description": "<p>Fired when somebody joins a room</p>",
    "version": "1.0.0",
    "name": "rooms_join_broadcast",
    "group": "RoomsBroadcast",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "user",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "user.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "user.roles",
            "description": "<p>User roles undefined</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/rooms.join.js",
    "groupTitle": "RoomsBroadcast"
  },
  {
    "type": "socket.io",
    "url": "rooms.leave.<roomId>",
    "title": "Leave a room",
    "description": "<p>Fired when somebody leaves a room</p>",
    "version": "1.0.0",
    "name": "rooms_leave_event",
    "group": "RoomsBroadcast",
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data",
            "description": "<p>User data</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"user\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>User type</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>User attributes</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.roles",
            "description": "<p>User roles undefined</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/rooms.leave.js",
    "groupTitle": "RoomsBroadcast"
  },
  {
    "type": "http",
    "url": "<prefix>.rooms.create",
    "title": "Create a room",
    "version": "1.0.0",
    "name": "rooms_create",
    "group": "Rooms",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "name",
            "description": "<p>Name of the room</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Auth token</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/rooms.create.js",
    "groupTitle": "Rooms"
  },
  {
    "type": "http",
    "url": "<prefix>.rooms.delete",
    "title": "Delete a room",
    "version": "1.0.0",
    "name": "rooms_delete",
    "group": "Rooms",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "id",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Parameter",
            "type": "String",
            "optional": false,
            "field": "token",
            "description": "<p>Auth token</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/rooms.delete.js",
    "groupTitle": "Rooms"
  },
  {
    "type": "socket.io",
    "url": "<prefix>.rooms.join",
    "title": "Join a room",
    "description": "<p>Returns collection of <code>message</code> objects. If the room has pinned message <code>pin</code> object will be first item in collection and will not affect meta.</p>",
    "version": "1.0.0",
    "name": "rooms_join",
    "group": "Rooms",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "id",
            "description": "<p><code>room</code> identificator</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "meta",
            "description": "<p>Collection metadata</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "meta.count",
            "description": "<p>Count of results</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "meta.before",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "meta.last",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "Object[]",
            "optional": false,
            "field": "data",
            "description": "<p>Collection of messages <code>message</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.id",
            "description": "<p><code>message</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"message\""
            ],
            "optional": false,
            "field": "data.type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes",
            "description": "<p>Message properties</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.text",
            "description": "<p>Message text</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "data.attributes.sanitizedText",
            "description": "<p>Message text processed by profanity filter</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "data.attributes.user",
            "description": "<p><code>user</code> object</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.user.id",
            "description": "<p>User identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": false,
            "field": "data.attributes.user.name",
            "description": "<p>User name</p>"
          },
          {
            "group": "Success 200",
            "type": "String[]",
            "optional": false,
            "field": "data.attributes.user.roles",
            "description": "<p>User roles undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Date-time",
            "optional": true,
            "field": "data.attributes.createdAt",
            "description": "<p>ISO Date</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/rooms.join.js",
    "groupTitle": "Rooms"
  },
  {
    "type": "socket.io",
    "url": "<prefix>.rooms.join",
    "title": "Leave a room",
    "version": "1.0.0",
    "name": "rooms_leave",
    "group": "Rooms",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "id",
            "description": "<p><code>room</code> identificator</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "meta",
            "description": "<p>Success metadata</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "allowedValues": [
              "\"success\""
            ],
            "optional": false,
            "field": "meta.status",
            "description": "<p>Response status</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/rooms.leave.js",
    "groupTitle": "Rooms"
  },
  {
    "type": "http",
    "url": "<prefix>.rooms.list",
    "title": "Get a list of rooms",
    "version": "1.0.0",
    "name": "rooms_list",
    "group": "Rooms",
    "filename": "../src/actions/rooms.list.js",
    "groupTitle": "Rooms"
  },
  {
    "type": "http",
    "url": "<prefix>.rooms.size",
    "title": "Get number of participants in room",
    "version": "1.0.0",
    "name": "rooms_size",
    "group": "Rooms",
    "parameter": {
      "fields": {
        "Parameter": [
          {
            "group": "Parameter",
            "type": "Uuid",
            "optional": false,
            "field": "roomId",
            "description": "<p><code>room</code> identificator</p>"
          }
        ]
      }
    },
    "success": {
      "fields": {
        "Success 200": [
          {
            "group": "Success 200",
            "type": "Uuid",
            "optional": false,
            "field": "id",
            "description": "<p><code>room</code> identificator</p>"
          },
          {
            "group": "Success 200",
            "type": "String",
            "optional": true,
            "field": "type",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Object",
            "optional": false,
            "field": "attributes",
            "description": "<p>undefined</p>"
          },
          {
            "group": "Success 200",
            "type": "Integer",
            "optional": false,
            "field": "attributes.size",
            "description": "<p>undefined</p>"
          }
        ]
      }
    },
    "filename": "../src/actions/rooms.size.js",
    "groupTitle": "Rooms"
  },
  {
    "type": "socket.io",
    "url": "<prefix>.users.me",
    "title": "Get current user",
    "version": "1.0.0",
    "name": "users_me",
    "group": "Users",
    "description": "<p>Get an information about current user</p>",
    "filename": "../src/actions/users.me.js",
    "groupTitle": "Users"
  }
] });
