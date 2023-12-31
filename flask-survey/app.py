from flask import Flask, request, render_template, flash, redirect, session
from flask_debugtoolbar import DebugToolbarExtension
import surveys

app = Flask(__name__)
app.config['SECRET_KEY'] = "nichen"
debug = DebugToolbarExtension(app)

"""Store survey.py info here"""
satisfaction_survey = surveys.satisfaction_survey
question_num = 0


@app.route('/')
def homepage():
    return render_template("base.html",satisfaction_survey=satisfaction_survey)

@app.route('/questions/<int:question_num>')
def questions(question_num):
    responses = session['responses']
    if question_num != len(responses):
        flash("You're trying to access an invalid question!")
        return redirect(f'/questions/{len(responses)}')
    elif question_num == len(satisfaction_survey.questions):
        return redirect('/thank-you')
    return render_template("questions.html",question_num=question_num,satisfaction_survey=satisfaction_survey)

@app.route('/answers', methods=["POST"])
def answers():
    responses = session['responses']
    responses.append(request.form.get('answer'))
    session['responses'] = responses
    if (len(responses) == len(satisfaction_survey.questions)):
        return redirect('/thank-you')
    next_question = len(responses)
    return redirect(f'/questions/{next_question}')

@app.route('/thank-you')
def thanks():
    return render_template("thanks.html")

@app.route('/start-session', methods=["POST"])
def start_session():
    responses = []
    session['responses'] = responses
    return redirect("/questions/0")

app.config['DEBUG_TB_INTERCEPT_REDIRECTS'] = False
if __name__ == "__main__":
    app.run(debug=True)
