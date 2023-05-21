from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from werkzeug.security import check_password_hash
from flask_migrate import Migrate
import pymysql
import os

app = Flask(__name__)

# database configuration
HOSTNAME = 'localhost'
PORT = '3306'
DATABASE = 'chatbot'
USERNAME = 'root'
PASSWORD = ''

app.config["SQLALCHEMY_DATABASE_URI"] = 'mysql+pymysql://{}:{}@{}:{}/{}?charset=utf8mb4'.format(
    USERNAME, PASSWORD, HOSTNAME, PORT, DATABASE)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = True
app.config["SECRET_KEY"] = os.urandom(24)
db = SQLAlchemy(app)

migrate = Migrate(app, db)

# User


class User(db.Model):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True)
    pwd = db.Column(db.String(100))
    addtime = db.Column(db.DateTime, index=True, default=datetime.now)

# Conversation


class Conversation(db.Model):
    __tablename__ = "conversation"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(100))
    startTime = db.Column(db.DateTime, index=True, default=datetime.now)
    # foreign key to User
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    User = db.relationship("User")

# Statement


class Statement(db.Model):
    __tablename__ = "statement"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    content = db.Column(db.String(1024))
    timeStamp = db.Column(db.DateTime, index=True, default=datetime.now)
    title = db.Column(db.String(4))  # User or Bot
    # foreign key to Conversation
    conversation_id = db.Column(db.Integer, db.ForeignKey("conversation.id"))
    Conversation = db.relationship("Conversation")

# Token


class Token(db.Model):
    __tablename__ = "token"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    content = db.Column(db.String(128))
    timeStamp = db.Column(db.DateTime, index=True, default=datetime.now)
    # foreign key to User
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    User = db.relationship("User")
