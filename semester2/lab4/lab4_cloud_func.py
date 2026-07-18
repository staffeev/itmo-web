import json
import urllib.request


def get_user_login(user_id):
    url = f"https://nd.kodaktor.ru/users/{user_id}"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
    return data["login"]


def handler(event, context):
    path = event.get("path", "")

    if path == "/login":
        return {
            "statusCode": 200,
            "body": "staffeev409626"
        }

    if path.startswith("/id/"):
        user_id = event.get("url").split("/id/")[1].strip("?")
        login = get_user_login(user_id)
        return {
            "statusCode": 200,
            "body": login
        }