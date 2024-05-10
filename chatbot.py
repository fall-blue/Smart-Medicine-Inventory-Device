from flask import Flask, request, render_template
import nltk
from nltk.stem import WordNetLemmatizer
import json
import numpy as np
from tensorflow.keras.models import load_model # type: ignore

app = Flask(__name__, template_folder='templates')

lemmatizer = WordNetLemmatizer()
intents = json.loads(open('intents.json').read())
model = load_model('chatbot_model.h5')

with open('classes.json', 'r') as f:
    classes = json.load(f)

with open('words.json', 'r') as f:
    words = json.load(f)

def clean_up_sentence(sentence):
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

def bow(sentence, words, show_details=True):
    sentence_words = clean_up_sentence(sentence)
    bag = [0]*len(words)
    for s in sentence_words:
        for i, word in enumerate(words):
            if word == s:
                bag[i] = 1
                if show_details:
                    print(f"Found in bag: {word}")
    return(np.array(bag))

def predict_class(sentence):
    p = bow(sentence, words,show_details=False)
    res = model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i,r] for i,r in enumerate(res) if r>ERROR_THRESHOLD]

    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({'intent': classes[r[0]], 'probability': str(r[1])})
    return return_list

def get_response(intents_list, intents_json):
    tag = intents_list[0]['intent']
    list_of_intents = intents_json['intents']
    for i in list_of_intents:
        if i['tag'] == tag:
            result = np.random.choice(i['responses'])
            break
    return result

@app.context_processor
def inject_script_root():
    return dict(SCRIPT_ROOT=request.script_root)

@app.route('/')
def index():
    return render_template('medicine-inventory-app.html')

@app.route('/get')
def get_bot_response():
    user_text = request.args.get('msg')
    ints = predict_class(user_text)
    res = get_response(ints, intents)
    return res

if __name__ == '__main__':
    app.run(debug=True)