import unittest,os
from flask_main import *


# valid token extracted from database
# for user {"account": "admin", "password": "123456789"}
valid_token="5eeb7003cc9edbc924cbd72b56dd8ad8"
class UserModelCase(unittest.TestCase):
    def setUp(self):
        self.app = app
        app.config['TESTING'] = True
        self.client = app.test_client()


    # def test_register(self):
    #     response = self.client.post("/register", data={"account": "admin", "password": "123456789"})
    #     self.assertEqual(response.data,b"/toLogin")


    def test_login(self):
        response = self.client.post("/login", data={"account": "admin", "password": "123456789"})

        resp_json = response.data

        resp_dict = json.loads(resp_json)

        self.assertIn("status", resp_dict)

        status = resp_dict.get("status")
        self.assertEqual(status, 200)

        data = json.loads(resp_dict.get("data"))

        self.assertEqual(data.get("user").get("name"), "admin")
        print("login_test_passed")

    def test_wrong_pwd_login(self):
        response = self.client.post("/login", data={"account": "admin", "password": "123456"})

        resp_json = response.data

        resp_dict = json.loads(resp_json)


        self.assertIn("status", resp_dict)

        status = resp_dict.get("status")
        self.assertEqual(status, 404)
        print("wrong_pwd_login_test_passed")

    def test_auto_login(self):
        response = self.client.post("/autoLogin", data={"token":valid_token})

        resp_json = response.data

        resp_dict = json.loads(resp_json)

        self.assertIn("status", resp_dict)

        status = resp_dict.get("status")
        self.assertEqual(status, 200)

        data = json.loads(resp_dict.get("data"))
        self.assertEqual(data.get("user").get("name"), "admin")
        print("auto_login_test_passed")

    def test_fetch_conversation(self):
        response = self.client.get(f"/fetchConversation/{valid_token}", data={"con_id":3})

        resp_json = response.data

        resp_dict = json.loads(resp_json)

        self.assertIn("status", resp_dict)

        status = resp_dict.get("status")
        self.assertEqual(status, 200)

        print("fetch_conversation_test_passed")

    def test_refresh_conversation(self):
        response = self.client.get(f"/refreshConversations/{valid_token}", data={"user_id":2})

        resp_json = response.data

        resp_dict = json.loads(resp_json)

        self.assertIn("status", resp_dict)

        status = resp_dict.get("status")
        self.assertEqual(status, 200)

        print("refresh_conversation_test_passed")

    def test_new_conversation(self):
        response = self.client.post(f"/fetchConversation/{valid_token}", data={"user_id":3,"title":"new conversation"})

        resp_json = response.data

        resp_dict = json.loads(resp_json)

        self.assertIn("status", resp_dict)

        status = resp_dict.get("status")
        self.assertEqual(status, 200)

        print("new_conversation_test_passed")

    def test_return_message(self):
        response = self.client.post(f"/returnMessage/{valid_token}", data={"con_id":3,"send_message":"Hello"})

        self.assertGreater(len(response.data),0)

        print("return_message_test_passed")

    def test_update_title(self):
        response = self.client.post(f"/updateConversationTitle/{valid_token}",
                                    data={"con_id": 3, "new_title": "new conversation"})

        resp_json = response.data

        resp_dict = json.loads(resp_json)

        self.assertIn("status", resp_dict)

        status = resp_dict.get("status")
        self.assertEqual(status, 200)

        print("update_title_test_passed")

    def test_logout(self):
        response = self.client.post(f"/logout",
                                    data={"token": valid_token})

        resp_json = response.data

        resp_dict = json.loads(resp_json)

        self.assertIn("status", resp_dict)

        status = resp_dict.get("status")
        self.assertEqual(status, 200)

        print("logout_test_passed")





if __name__ == '__main__':
    unittest.main()


