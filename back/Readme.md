# Document of backend

## login

endpoint: `/api/token`

method: [POST]

body:

```json
{
  "username": "admin",
  "password": "admin"
}
```

## read chat messages

endpoint: `/api/chat_bot`

method: [GET]

response :

```json
{
  "id": 4,
  "user_message": "چطوری میتونم پایتون رو بهتر یاد بگیرم؟",
  "bot_response": "hello",
  "created_at": "2025-07-09T17:09:55.936912+03:30"
}
```

## chat bot

endpoint: `/api/chat_bot`

method: [POST]

body:

```json
{
  "message": ""
  "course_id" : ""
}
```

response :

```json
{
  "id": 4,
  "user_message": "چطوری میتونم پایتون رو بهتر یاد بگیرم؟",
  "bot_response": "hello",
  "created_at": "2025-07-09T17:09:55.936912+03:30"
}
```

## user_courses

endpoint : `/api/user_course`

method: [GET]

## course list

endpoint : `/api/course_list`

method: [GET]

response :

```json
[
  {
    "name": "python",
    "detail": "this is python course",
    "chapters": [
      {
        "name": "first chapter",
        "detail": "this is pythons first chapter",
        "sections": [
          {
            "name": "first section",
            "detail": "this is first section",
            "first_message": "section first message"
          }
        ]
      }
    ],
    "last_section": {
      "name": "first section",
      "detail": "this is first section"
    }
  }
]
```

## question

endponit : `/api/quest`

method : [post]

response
