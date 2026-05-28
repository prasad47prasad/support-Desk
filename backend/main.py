import os
from datetime import datetime, timedelta

from fastapi import FastAPI, Form, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import SessionLocal, engine
from models import Base, Employee, Ticket, Client, TicketHistory, TicketChat


app = FastAPI()

# Create uploads folder if not exists
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create database tables
Base.metadata.create_all(bind=engine)


# Database session per request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------------
# HOME API
# -----------------------------------
@app.get("/")
def home():
    return {"message": "Office Ticket System Running"}


# -----------------------------------
# ADD EMPLOYEE
# -----------------------------------
@app.post("/add-employee")
def add_employee(
    employee_id: str,
    name: str,
    role: str,
    password: str,
    db=Depends(get_db)
):
    try:
        existing_employee = db.query(Employee).filter(
            Employee.employee_id == employee_id
        ).first()

        if existing_employee:
            return {"error": "Employee ID already exists"}

        employee = Employee(
            employee_id=employee_id,
            name=name,
            role=role,
            password=password
        )

        db.add(employee)
        db.commit()
        db.refresh(employee)

        return {"message": "Employee Added Successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------
# GET ALL EMPLOYEES
# -----------------------------------
@app.get("/employees")
def get_employees(db=Depends(get_db)):
    employees = db.query(Employee).all()

    return [
        {
            "id": emp.id,
            "employee_id": emp.employee_id,
            "name": emp.name,
            "role": emp.role
        }
        for emp in employees
    ]


# -----------------------------------
# LOGIN
# -----------------------------------
@app.post("/login")
def login(
    employee_id: str,
    password: str,
    db=Depends(get_db)
):
    employee = db.query(Employee).filter(
        Employee.employee_id == employee_id,
        Employee.password == password
    ).first()

    if not employee:
        return {"error": "Invalid Employee ID or Password"}

    return {
        "message": "Login Successful",
        "employee_id": employee.employee_id,
        "name": employee.name,
        "role": employee.role
    }


# -----------------------------------
# ADD CLIENT
# -----------------------------------
@app.post("/add-client")
def add_client(
    client_name: str,
    whatsapp_group_link: str,
    contact_person: str,
    mobile_number: str,
    db=Depends(get_db)
):
    try:
        existing_client = db.query(Client).filter(
            Client.client_name == client_name
        ).first()

        if existing_client:
            return {"error": "Client already exists"}

        client = Client(
            client_name=client_name,
            whatsapp_group_link=whatsapp_group_link,
            contact_person=contact_person,
            mobile_number=mobile_number
        )

        db.add(client)
        db.commit()
        db.refresh(client)

        return {"message": "Client Added Successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------
# GET ALL CLIENTS
# -----------------------------------
@app.get("/clients")
def get_clients(db=Depends(get_db)):
    clients = db.query(Client).all()

    return [
        {
            "id": c.id,
            "client_name": c.client_name,
            "whatsapp_group_link": c.whatsapp_group_link,
            "contact_person": c.contact_person,
            "mobile_number": c.mobile_number
        }
        for c in clients
    ]


# -----------------------------------
# DELETE CLIENT
# -----------------------------------
@app.delete("/delete-client/{client_id}")
def delete_client(
    client_id: int,
    db=Depends(get_db)
):
    try:
        client = db.query(Client).filter(Client.id == client_id).first()

        if not client:
            return {"error": "Client not found"}

        db.delete(client)
        db.commit()

        return {"message": "Client Deleted Successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------
# RESET PASSWORD
# -----------------------------------
@app.put("/reset-password")
def reset_password(
    employee_id: str,
    new_password: str,
    db=Depends(get_db)
):
    try:
        employee = db.query(Employee).filter(
            Employee.employee_id == employee_id
        ).first()

        if not employee:
            return {"error": "Employee not found"}

        employee.password = new_password
        db.commit()

        return {"message": "Password Reset Successful"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------
# UPDATE EMPLOYEE
# -----------------------------------
@app.put("/update-employee/{employee_id}")
def update_employee(
    employee_id: str,
    name: str,
    role: str,
    db=Depends(get_db)
):
    try:
        employee = db.query(Employee).filter(
            Employee.employee_id == employee_id
        ).first()

        if not employee:
            return {"error": "Employee not found"}

        employee.name = name
        employee.role = role

        db.commit()

        return {"message": "Employee Updated Successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------
# DELETE EMPLOYEE
# -----------------------------------
@app.delete("/delete-employee/{employee_id}")
def delete_employee(
    employee_id: str,
    db=Depends(get_db)
):
    try:
        employee = db.query(Employee).filter(
            Employee.employee_id == employee_id
        ).first()

        if not employee:
            return {"error": "Employee not found"}

        db.delete(employee)
        db.commit()

        return {"message": "Employee Deleted Successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------
# CREATE TICKET
# -----------------------------------
@app.post("/create-ticket")
async def create_ticket(
    client_id: int = Form(...),
    issue: str = Form(...),
    priority: str = Form(...),
    assigned_to: str = Form("Auto"),
    db=Depends(get_db)
):
    try:
        client = db.query(Client).filter(Client.id == client_id).first()

        if not client:
            return {"error": "Client not found"}

        employees = db.query(Employee).all()

        if not employees:
            return {"error": "No employees found"}

        if assigned_to != "Auto":
            assigned_employee = db.query(Employee).filter(
                Employee.name == assigned_to
            ).first()

            if not assigned_employee:
                return {"error": "Selected employee not found"}

        else:
            last_ticket = db.query(Ticket).order_by(Ticket.id.desc()).first()

            if not last_ticket:
                assigned_employee = employees[0]
            else:
                last_assigned = last_ticket.assigned_to
                current_index = 0

                for i, emp in enumerate(employees):
                    if emp.name == last_assigned:
                        current_index = i
                        break

                next_index = (current_index + 1) % len(employees)
                assigned_employee = employees[next_index]

        ticket = Ticket(
            client_id=client.id,
            issue=issue,
            priority=priority,
            assigned_to=assigned_employee.name,
            status="Open",
            created_at=str(datetime.now()),
            completed_at=None
        )

        db.add(ticket)
        db.commit()
        db.refresh(ticket)

        history = TicketHistory(
            ticket_id=ticket.id,
            action="Ticket Created",
            performed_by="Admin",
            created_at=str(datetime.now())
        )

        db.add(history)
        db.commit()

        return {
            "message": "Ticket Created Successfully",
            "ticket_id": ticket.id,
            "client_name": client.client_name,
            "assigned_to": assigned_employee.name
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------
# GET ALL TICKETS
# -----------------------------------
@app.get("/tickets")
def get_tickets(db=Depends(get_db)):
    tickets = db.query(Ticket).all()

    data = []

    for t in tickets:
        client = db.query(Client).filter(Client.id == t.client_id).first()

        data.append({
            "id": t.id,
            "client_id": t.client_id,
            "client_name": client.client_name if client else "Unknown",
            "whatsapp_group_link": client.whatsapp_group_link if client else "",
            "issue": t.issue,
            "priority": t.priority,
            "status": t.status,
            "assigned_to": t.assigned_to,
            "created_at": t.created_at,
            "completed_at": t.completed_at
        })

    return data


# -----------------------------------
# EMPLOYEE WISE TICKETS
# -----------------------------------
@app.get("/employee-tickets/{employee_name}")
def get_employee_tickets(
    employee_name: str,
    db=Depends(get_db)
):
    tickets = db.query(Ticket).filter(
        Ticket.assigned_to == employee_name
    ).all()

    data = []

    for t in tickets:
        client = db.query(Client).filter(Client.id == t.client_id).first()

        data.append({
            "id": t.id,
            "client_id": t.client_id,
            "client_name": client.client_name if client else "Unknown",
            "whatsapp_group_link": client.whatsapp_group_link if client else "",
            "issue": t.issue,
            "priority": t.priority,
            "status": t.status,
            "assigned_to": t.assigned_to,
            "created_at": t.created_at,
            "completed_at": t.completed_at
        })

    return data


# -----------------------------------
# DELETE TICKET
# -----------------------------------
@app.delete("/delete-ticket/{ticket_id}")
def delete_ticket(
    ticket_id: int,
    db=Depends(get_db)
):
    try:
        ticket = db.query(Ticket).filter(
            Ticket.id == ticket_id
        ).first()

        if not ticket:
            return {"error": "Ticket not found"}

        db.delete(ticket)
        db.commit()

        return {"message": "Ticket Deleted Successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------
# UPDATE TICKET STATUS
# -----------------------------------
@app.put("/update-ticket-status/{ticket_id}")
def update_ticket_status(
    ticket_id: int,
    status: str,
    db=Depends(get_db)
):
    try:
        ticket = db.query(Ticket).filter(
            Ticket.id == ticket_id
        ).first()

        if not ticket:
            return {"error": "Ticket not found"}

        if ticket.status == "Completed":
            return {"error": "Completed ticket cannot be changed again"}

        if ticket.status == "Open" and status != "In Progress":
            return {"error": "Open ticket can only move to In Progress"}

        if ticket.status == "In Progress" and status != "Completed":
            return {"error": "In Progress ticket can only move to Completed"}

        ticket.status = status

        if status == "Completed":
            ticket.completed_at = str(datetime.now())

        db.commit()

        history = TicketHistory(
            ticket_id=ticket.id,
            action=status,
            performed_by=ticket.assigned_to,
            created_at=str(datetime.now())
        )

        db.add(history)
        db.commit()

        return {
            "message": "Ticket Status Updated",
            "ticket_id": ticket.id,
            "new_status": ticket.status
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------
# TICKET CHAT SEND
# -----------------------------------
@app.post("/ticket-chat")
def send_ticket_chat(
    ticket_id: int,
    sender_name: str,
    message: str,
    db=Depends(get_db)
):
    try:
        ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()

        if not ticket:
            return {"error": "Ticket not found"}

        chat = TicketChat(
            ticket_id=ticket_id,
            sender_name=sender_name,
            message=message,
            created_at=str(datetime.now())
        )

        db.add(chat)
        db.commit()

        return {"message": "Chat Message Sent Successfully"}

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------------
# GET TICKET CHAT
# -----------------------------------
@app.get("/ticket-chat/{ticket_id}")
def get_ticket_chat(
    ticket_id: int,
    db=Depends(get_db)
):
    chats = db.query(TicketChat).filter(
        TicketChat.ticket_id == ticket_id
    ).all()

    return [
        {
            "id": c.id,
            "ticket_id": c.ticket_id,
            "sender_name": c.sender_name,
            "message": c.message,
            "created_at": c.created_at
        }
        for c in chats
    ]


# -----------------------------------
# DAILY REPORT
# -----------------------------------
@app.get("/daily-report")
def daily_report(db=Depends(get_db)):
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)

    tickets = db.query(Ticket).all()

    today_tasks = []
    today_completed = []
    today_pending = []
    old_pending = []
    yesterday_pending = []

    for t in tickets:
        if t.created_at:
            created_date = datetime.fromisoformat(t.created_at).date()

            if created_date == today:
                today_tasks.append(t)

                if t.status == "Completed":
                    today_completed.append(t)
                else:
                    today_pending.append(t)

            elif t.status != "Completed":
                old_pending.append(t)

                if created_date == yesterday:
                    yesterday_pending.append(t)

    return {
        "today_total_tasks": len(today_tasks),
        "today_completed": len(today_completed),
        "today_pending": len(today_pending),
        "old_pending": len(old_pending),
        "yesterday_pending": len(yesterday_pending)
    }


# -----------------------------------
# TICKET HISTORY
# -----------------------------------
@app.get("/ticket-history/{ticket_id}")
def get_ticket_history(
    ticket_id: int,
    db=Depends(get_db)
):
    history = db.query(TicketHistory).filter(
        TicketHistory.ticket_id == ticket_id
    ).all()

    return [
        {
            "id": h.id,
            "ticket_id": h.ticket_id,
            "action": h.action,
            "performed_by": h.performed_by,
            "created_at": h.created_at
        }
        for h in history
    ]