from flask import Flask,  render_template, request, redirect, url_for,jsonify
from werkzeug.utils import secure_filename
import os
from datetime import timedelta
import urllib
import requests
import openai
import hashlib
import json
from app import *
OPENAI_API_KEY = "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"
openai.organization = "org-cf6TK4aeo1LotntOuVgjbHaR"
openai.api_key = OPENAI_API_KEY

md5 = hashlib.md5()  # Create md5 encryption object


# navigate to login page
@app.route('/',methods=['GET','POST'])
@app.route('/toLogin',methods=['GET','POST'])
def toLogin():
    return render_template('login.html')

# navigate to register page
@app.route('/toRegister',methods=['GET','POST'])
def toRegister():
    return render_template('register.html')

# navigate to main page
@app.route('/toIndex/<token>',methods=['GET','POST'])
def toIndex(token):
    if token_validate(token):
        return render_template('index.html')


@app.route('/returnMessage/<token>',methods=['GET','POST'])
def returnMessage(token):
    if token_validate(token):
        send_message = request.values.get("send_message")
        print("对方发送的消息：" + send_message)
        query = Statement(content=send_message,title="User",conversation_id=request.values.get("con_id"))
        db.session.add(query)
        # openAI 版本
        completion = openai.ChatCompletion.create(model="gpt-3.5-turbo",
                                                  messages=[{"role": "user", "content": send_message}])
        message = completion.choices[0].message.content
        print("Chatgpt: ", message)
        reply = Statement(content=message, title="Bot", conversation_id=request.values.get("con_id"))
        db.session.add(reply)
        db.session.commit()
        return message
        # return html.json()["content"]

# Automatically generate a new conversation when log in
@app.route('/login',methods=['GET','POST'])
def logIn():
    md5.update(request.values.get("password").encode('utf-8'))  # String to be encrypted
    pwd_md5 = md5.hexdigest()  # Encrypted String
    # print(pwd_md5)
    user = User.query.filter_by(name=request.values.get("account"),pwd=pwd_md5).first()
    if user:
        # create token
        original_token=(user.name+str(datetime.now().timestamp())).encode('utf-8')
        md5.update(original_token)  # String to be encrypted
        token = md5.hexdigest()  # Encrypted String
        new_token = Token(content=token,user_id=user.id)
        db.session.add(new_token)
        db.session.commit()
        conversation_id=create_conversation("Default Title",request.values.get("user_id"))
        data={
            "url":url_for("toIndex",token=token),
            "token":token,
            "user":{
                "name":user.name,
                "id":user.id
            },
            "con_id":conversation_id
        }
        return {"status":200,"data":json.dumps(data)}
    else:
        return {"status":404}

@app.route('/autoLogin',methods=['GET','POST'])
def autoLogIn():
    token = request.values.get("token")
    if token_validate(token):
        TOKEN = Token.query.filter_by(content=token).first()
        conversation_id = create_conversation("Default Title", request.values.get("user_id"))
        data={
            "url":url_for("toIndex",token=token),
            "user":{
                "id":TOKEN.User.id,
                "name":TOKEN.User.name
            },
            "con_id": conversation_id
        }
        return {"status":200,"data":json.dumps(data)}
    else:
        return {"status":404}

@app.route('/register',methods=['GET','POST'])
def register():
    md5.update(request.values.get("password").encode('utf-8'))  # String to be encrypted
    pwd_md5 = md5.hexdigest()  # Encrypted String
    new_user=User(name=request.values.get("account"),pwd=pwd_md5)
    db.session.add(new_user)
    db.session.commit()
    return url_for("toLogin")

# auxiliary function, to validate token
def token_validate(token_md5):
    token = Token.query.filter_by(content=token_md5).first()
    if not token:
        return False
    Duration = 24*60*60 # Token is valid for 24 hours
    TS_Now=datetime.now()
    if TS_Now.timestamp() - token.timeStamp.timestamp() >= Duration:
        # Token is invalid
        db.session.delete(token)
        db.session.commit()
        return False
    else:
        # Update the timestamp of the token
        token.timeStamp=TS_Now
        db.session.commit()
        return True

# auxiliary function, to start a new conversation
def create_conversation(title,user_id):
    new_conversation = Conversation(title=title,user_id=user_id)
    db.session.add(new_conversation)
    db.session.commit()
    return new_conversation.id

if __name__ == '__main__':
    app.run(debug=True)