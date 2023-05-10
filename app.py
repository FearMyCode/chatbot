from flask import Flask, render_template, jsonify, request

app = Flask(__name__)

# Chat data
conversations = [
    {
        'id': 1,
        'title': 'Conversation 1',
        'messages': [
            'Message 1',
            'Message 2',
            'Message 3'
        ]
    },
    {
        'id': 2,
        'title': 'Conversation 2',
        'messages': [
            'Message 4',
            'Message 5'
        ]
    }
]

# Chat API endpoints


@app.route('/')
def index():
    return render_template('chatbot.html')


@app.route('/chat/conversations', methods=['GET'])
def get_conversation_titles():
    titles = [conversation['title'] for conversation in conversations]
    return jsonify({'success': True, 'conversations': titles})


@app.route('/chat/conversation', methods=['POST'])
def get_conversation_by_title():
    title = request.form.get('title')
    for conversation in conversations:
        if conversation['title'] == title:
            return jsonify({'success': True, 'messages': conversation['messages']})
    return jsonify({'success': False, 'message': 'Conversation not found'})


@app.route('/chat/<int:conversation_id>', methods=['GET'])
def get_conversation_by_id(conversation_id):
    for conversation in conversations:
        if conversation['id'] == conversation_id:
            return jsonify({'success': True, 'messages': conversation['messages']})
    return jsonify({'success': False, 'message': 'Conversation not found'})


@app.route('/chat/update', methods=['POST'])
def update_conversation():
    message = request.form.get('message')
    conversation_id = int(request.form.get('conversation_id'))
    for conversation in conversations:
        if conversation['id'] == conversation_id:
            conversation['messages'].append(message)
            return jsonify({'success': True})
    return jsonify({'success': False, 'message': 'Conversation not found'})


if __name__ == '__main__':
    app.run(debug=True)
