from datetime import date
from typing import Literal
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import func
from .database import get_db, engine, Base
from .models import User, FinancialProfile, Income, Expense, Investment, Goal, Loan, SimulationRun, Scenario
from .security import hash_password, verify_password, token, current_user_id
from .services.simulation import simulate

app=FastAPI(title='FutureFinance API', version='1.0.0')
app.add_middleware(CORSMiddleware,allow_origins=['http://localhost:5173','http://127.0.0.1:5173'],allow_credentials=True,allow_methods=['*'],allow_headers=['*'])
@app.on_event('startup')
def initialize_local_preview():
    # MySQL schema is installed from database/*.sql; SQLite lets reviewers preview locally.
    if str(engine.url).startswith('sqlite'):
        Base.metadata.create_all(engine)
        with Session(engine) as db:
            if not db.query(User).first():
                pw_hash = hash_password('FutureFinance@123')
                demo_user = User(name='Demo User', email='demo@futurefinance.in', password_hash=pw_hash)
                aarav = User(name='Aarav Sharma', email='aarav@example.in', password_hash=pw_hash)
                db.add_all([demo_user, aarav])
                db.flush()

                p1 = FinancialProfile(user_id=demo_user.id, age=28, monthly_income=85000, savings=180000, risk_tolerance='moderate')
                p2 = FinancialProfile(user_id=aarav.id, age=28, monthly_income=85000, savings=180000, risk_tolerance='moderate')
                db.add_all([p1, p2])

                today = date.today()
                db.add_all([
                    Income(user_id=demo_user.id, source='Salary', amount=85000, received_on=today),
                    Income(user_id=demo_user.id, source='Freelance', amount=15000, received_on=today),
                    Expense(user_id=demo_user.id, category='Rent', amount=25000, spent_on=today, description='Monthly rent'),
                    Expense(user_id=demo_user.id, category='Food', amount=9000, spent_on=today, description='Groceries & dining'),
                    Expense(user_id=demo_user.id, category='Entertainment', amount=6000, spent_on=today, description='Streaming and outings'),
                    Expense(user_id=demo_user.id, category='Utilities', amount=4500, spent_on=today, description='Electricity & broadband'),
                    Investment(user_id=demo_user.id, name='Nifty 50 Index', investment_type='Mutual Funds', amount_invested=120000, current_value=142000, purchase_date=today, expected_return=11, risk_level='medium'),
                    Investment(user_id=demo_user.id, name='SGB Sovereign Gold', investment_type='Gold', amount_invested=50000, current_value=58000, purchase_date=today, expected_return=8, risk_level='low'),
                    Investment(user_id=demo_user.id, name='Bluechip ETF', investment_type='ETFs', amount_invested=80000, current_value=95000, purchase_date=today, expected_return=12, risk_level='high'),
                    Goal(user_id=demo_user.id, name='Emergency Fund', target_amount=400000, current_amount=180000, target_date=date(2028, 1, 1), priority='high'),
                    Goal(user_id=demo_user.id, name='Europe Travel', target_amount=300000, current_amount=60000, target_date=date(2027, 6, 1), priority='medium'),
                    Goal(user_id=demo_user.id, name='House Down Payment', target_amount=2500000, current_amount=600000, target_date=date(2031, 1, 1), priority='high'),
                    Loan(user_id=demo_user.id, lender='HDFC Bank', outstanding_amount=180000, monthly_emi=8500),
                    Scenario(user_id=demo_user.id, name='Reduce expenses 10%', expense_change_pct=-10, contribution_change=0),
                    Scenario(user_id=demo_user.id, name='Invest extra ₹5,000', expense_change_pct=0, contribution_change=5000)
                ])
                db.commit()
class Register(BaseModel): name:str=Field(min_length=2); email:EmailStr; password:str=Field(min_length=8)
class Login(BaseModel): email:EmailStr; password:str
class Money(BaseModel): amount:float=Field(gt=0); description:str|None=None
class IncomeIn(Money): source:str; received_on:date=date.today()
class ExpenseIn(Money): category:str; spent_on:date=date.today()
class InvestmentIn(BaseModel): name:str; investment_type:str; amount_invested:float=Field(gt=0); current_value:float=Field(ge=0); purchase_date:date; expected_return:float=10; risk_level:str='medium'
class GoalIn(BaseModel): name:str; target_amount:float=Field(gt=0); current_amount:float=Field(ge=0); target_date:date; priority:str='medium'
class SimIn(BaseModel): initial_amount:float=Field(ge=0); monthly_contribution:float=Field(ge=0); annual_return:float=Field(ge=-50,le=100); volatility:float=Field(ge=0,le=100); years:int=Field(ge=1,le=50); simulations:int=Field(default=5000,ge=100,le=20000); goal_target:float|None=Field(default=None,ge=0)
class ScenarioIn(BaseModel): name:str; income_change_pct:float=0; expense_change_pct:float=0; contribution_change:float=0
def owned(db, model, record_id, uid):
    row=db.get(model,record_id)
    if not row or row.user_id!=uid: raise HTTPException(404,'Record not found')
    return row
@app.get('/health')
def health(): return {'status':'ok','app':'FutureFinance'}
@app.post('/api/auth/register')
def register(v:Register,db:Session=Depends(get_db)):
    if db.query(User).filter_by(email=v.email).first(): raise HTTPException(409,'Email already registered')
    u=User(name=v.name,email=v.email,password_hash=hash_password(v.password)); db.add(u); db.flush(); db.add(FinancialProfile(user_id=u.id)); db.commit(); return {'access_token':token(u.id),'user':{'id':u.id,'name':u.name,'email':u.email}}
@app.post('/api/auth/login')
def login(v:Login,db:Session=Depends(get_db)):
    u=db.query(User).filter_by(email=v.email).first()
    if not u or not verify_password(v.password,u.password_hash): raise HTTPException(401,'Incorrect email or password')
    return {'access_token':token(u.id),'user':{'id':u.id,'name':u.name,'email':u.email}}
def crud(prefix, model, schema):
    @app.get(prefix)
    def list_rows(uid:int=Depends(current_user_id),db:Session=Depends(get_db)): return db.query(model).filter_by(user_id=uid).order_by(model.id.desc()).all()
    @app.post(prefix)
    def create(v:schema,uid:int=Depends(current_user_id),db:Session=Depends(get_db)):
        row=model(user_id=uid,**v.model_dump()); db.add(row); db.commit(); db.refresh(row); return row
    @app.put(prefix+'/{record_id}')
    def update(record_id:int,v:schema,uid:int=Depends(current_user_id),db:Session=Depends(get_db)):
        row=owned(db,model,record_id,uid)
        for k,val in v.model_dump().items(): setattr(row,k,val)
        db.commit(); db.refresh(row); return row
    @app.delete(prefix+'/{record_id}')
    def delete(record_id:int,uid:int=Depends(current_user_id),db:Session=Depends(get_db)):
        db.delete(owned(db,model,record_id,uid)); db.commit(); return {'deleted':True}
crud('/api/income',Income,IncomeIn); crud('/api/expenses',Expense,ExpenseIn); crud('/api/investments',Investment,InvestmentIn); crud('/api/goals',Goal,GoalIn)
@app.get('/api/dashboard')
def dashboard(uid:int=Depends(current_user_id),db:Session=Depends(get_db)):
    income=db.query(func.coalesce(func.sum(Income.amount),0)).filter(Income.user_id==uid).scalar(); expenses=db.query(func.coalesce(func.sum(Expense.amount),0)).filter(Expense.user_id==uid).scalar(); investments=db.query(func.coalesce(func.sum(Investment.current_value),0)).filter(Investment.user_id==uid).scalar(); profile=db.query(FinancialProfile).filter_by(user_id=uid).first(); categories=db.query(Expense.category,func.sum(Expense.amount)).filter_by(user_id=uid).group_by(Expense.category).order_by(func.sum(Expense.amount).desc()).all(); savings=max(0,income-expenses); score=health_data(income,expenses,profile.savings if profile else 0,investments,db.query(Loan).filter_by(user_id=uid).all(),db.query(Goal).filter_by(user_id=uid).all())
    return {'monthly_income':income,'monthly_expenses':expenses,'monthly_savings':savings,'portfolio_value':investments,'savings_balance':profile.savings if profile else 0,'expense_categories':[{'name':x,'value':y} for x,y in categories],'health':score,'highest_category':categories[0][0] if categories else None}
def health_data(income,expenses,savings,investments,loans,goals):
    sr=(income-expenses)/income if income else 0; debt=sum(x.outstanding_amount for x in loans); dti=debt/(income*12) if income else 1; emergency=min(1,savings/(expenses*6)) if expenses else 1; diversify=min(1,investments/100000) # deterministic transparent baseline
    gp=sum(min(1,g.current_amount/g.target_amount) for g in goals)/len(goals) if goals else .5
    parts={'Savings rate':round(max(0,min(25,sr*125)),1),'Debt management':round(max(0,25*(1-dti)),1),'Emergency fund':round(emergency*20,1),'Investment diversification':round(diversify*15,1),'Goal progress':round(gp*15,1)}
    return {'score':round(sum(parts.values()),1),'breakdown':parts,'metrics':{'savings_rate':round(sr*100,1),'debt_to_income':round(dti*100,1)}}
@app.get('/api/financial-health')
def financial_health(uid:int=Depends(current_user_id),db:Session=Depends(get_db)):
    return dashboard(uid,db)['health']
@app.get('/api/insights')
def insights(uid:int=Depends(current_user_id),db:Session=Depends(get_db)):
    d=dashboard(uid,db); out=[]; rate=d['health']['metrics']['savings_rate']
    if rate<20: out.append({'recommendation':'Increase monthly savings','reason':f'Your savings rate is {rate}%, below the 20% target.','metrics':{'income':d['monthly_income'],'expenses':d['monthly_expenses']},'impact':'Build a stronger safety margin','strength':'high'})
    if d['monthly_expenses'] and d['savings_balance']<d['monthly_expenses']*3: out.append({'recommendation':'Build an emergency fund','reason':'Your liquid savings cover fewer than three months of expenses.','metrics':{'savings':d['savings_balance']},'impact':'Reduce disruption risk','strength':'high'})
    if d['highest_category']: out.append({'recommendation':f'Review {d["highest_category"]} spending','reason':f'{d["highest_category"]} is currently your largest spending category.','metrics':{'highest_category':d['highest_category']},'impact':'Potentially free cash for goals','strength':'medium'})
    return out
@app.post('/api/simulation/run')
def run_sim(v:SimIn,uid:int=Depends(current_user_id),db:Session=Depends(get_db)):
    run=SimulationRun(user_id=uid,**v.model_dump()); db.add(run); db.commit(); result=simulate(v.initial_amount,v.monthly_contribution,v.annual_return,v.volatility,v.years,v.simulations,v.goal_target); return {'run_id':run.id,**result,'disclaimer':'Simulation estimates are not guaranteed financial predictions.'}
@app.get('/api/simulation/{run_id}')
def get_sim(run_id:int,uid:int=Depends(current_user_id),db:Session=Depends(get_db)):
    r=owned(db,SimulationRun,run_id,uid); return {'run_id':r.id,**simulate(r.initial_amount,r.monthly_contribution,r.annual_return,r.volatility,r.years,r.simulations,r.goal_target),'disclaimer':'A fresh illustrative estimate; markets are uncertain.'}
@app.get('/api/scenarios')
def scenarios(uid:int=Depends(current_user_id),db:Session=Depends(get_db)): return db.query(Scenario).filter_by(user_id=uid).all()
@app.post('/api/scenarios')
def scenario(v:ScenarioIn,uid:int=Depends(current_user_id),db:Session=Depends(get_db)):
    s=Scenario(user_id=uid,**v.model_dump()); db.add(s); db.commit(); return s
