from flask import Flask, render_template, request, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from datetime import date

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///assignments.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Assignment(db.Model):
    id       = db.Column(db.Integer, primary_key=True)
    title    = db.Column(db.String(200), nullable=False)
    due_date = db.Column(db.Date, nullable=False)
    priority = db.Column(db.String(10), default='Medium')  # Low / Medium / High
    status   = db.Column(db.String(10), default='Pending') # Pending / Done

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    assignments = Assignment.query.order_by(Assignment.due_date).all()
    return render_template('index.html', assignments=assignments, today=date.today())

@app.route('/add', methods=['POST'])
def add():
    db.session.add(Assignment(
        title    = request.form.get('title'),
        due_date = date.fromisoformat(request.form.get('due_date')),
        priority = request.form.get('priority', 'Medium')
    ))
    db.session.commit()
    return redirect(url_for('home'))

@app.route('/view/<int:aid>')
def view(aid):
    return render_template('assignment.html', a=Assignment.query.get_or_404(aid), edit=False)

@app.route('/edit/<int:aid>', methods=['GET', 'POST'])
def edit(aid):
    a = Assignment.query.get_or_404(aid)
    if request.method == 'POST':
        a.title    = request.form.get('title')
        a.due_date = date.fromisoformat(request.form.get('due_date'))
        a.priority = request.form.get('priority')
        a.status   = request.form.get('status')
        db.session.commit()
        return redirect(url_for('home'))
    return render_template('assignment.html', a=a, edit=True)

@app.route('/status/<int:aid>/<string:new_status>')
def change_status(aid, new_status):
    a = Assignment.query.get_or_404(aid)
    a.status = 'Done' if new_status == 'done' else 'Pending'
    db.session.commit()
    return redirect(url_for('home'))

@app.route('/delete/<int:aid>')
def delete(aid):
    a = Assignment.query.get_or_404(aid)
    db.session.delete(a)
    db.session.commit()
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)
