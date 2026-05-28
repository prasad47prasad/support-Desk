import os
from datetime import datetime
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from database import SessionLocal, engine
from models import Base, Employee, Ticket, Client, TicketHistory, TicketChat

app = FastAPI()

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

# CREATE DATABASE TABLES
Base.metadata.create_all(bind=engine)

# DATABASE SESSION
db = SessionLocal()


# -----------------------------------
# HOME API
# -----------------------------------
@app.get("/")
def home():

    return {
        "message": "Office Ticket System Running"
    }


# -----------------------------------
# ADD EMPLOYEE
# -----------------------------------
@app.post("/add-employee")
def add_employee(

    employee_id: str,
    name: str,
    role: str,
    password: str

):

    existing_employee = db.query(Employee).filter(
        Employee.employee_id == employee_id
    ).first()

    if existing_employee:

        return {
            "error": "Employee ID already exists"
        }

    employee = Employee(
        
        employee_id=employee_id,
        name=name,
        role=role,
        password=password

    )

    db.add(employee)
    db.commit()

    return {
        "message": "Employee Added Successfully"
    }


# -----------------------------------
# GET ALL EMPLOYEES
# -----------------------------------
@app.get("/employees")
def get_employees():

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
def login(employee_id: str, password: str):

    employee = db.query(Employee).filter(

        Employee.employee_id == employee_id,
        Employee.password == password

    ).first()

    if not employee:

        return {
            "error": "Invalid Employee ID or Password"
        }

    return {

        "message": "Login Successful",
        "employee_id": employee.employee_id,
        "name": employee.name,
        "role": employee.role

    }
# -----------------------------
# ADD CLIENT
# -----------------------------
@app.post("/add-client")
def add_client(
    client_name: str,
    whatsapp_group_link: str,
    contact_person: str,
    mobile_number: str
):
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

    return {"message": "Client Added Successfully"}

# -----------------------------
# DELETE CLIENTS
# -----------------------------

@app.delete("/delete-client/{client_id}")
def delete_client(client_id: int):
    client = db.query(Client).filter(Client.id == client_id).first()

    if not client:
        return {"error": "Client not found"}

    db.delete(client)
    db.commit()

    return {"message": "Client Deleted Successfully"}

# -----------------------------
# GET ALL CLIENTS
# -----------------------------
@app.get("/clients")
def get_clients():
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

# -----------------------------
# RESET PASSWORD
# -----------------------------
@app.put("/reset-password")
def reset_password(employee_id: str, new_password: str):

    employee = db.query(Employee).filter(
        Employee.employee_id == employee_id
    ).first()

    if not employee:
        return {"error": "Employee not found"}

    employee.password = new_password
    db.commit()

    return {"message": "Password Reset Successful"}

# -----------------------------
# UPDATE EMPLOYEE
# -----------------------------
@app.put("/update-employee/{employee_id}")
def update_employee(
    employee_id: str,
    name: str,
    role: str
):

    employee = db.query(Employee).filter(
        Employee.employee_id == employee_id
    ).first()

    if not employee:
        return {
            "error": "Employee not found"
        }

    employee.name = name
    employee.role = role

    db.commit()

    return {
        "message": "Employee Updated Successfully"
    }


# -----------------------------
# DELETE EMPLOYEE
# -----------------------------
@app.delete("/delete-employee/{employee_id}")
def delete_employee(employee_id: str):
    employee = db.query(Employee).filter(
        Employee.employee_id == employee_id
    ).first()

    if not employee:
        return {"error": "Employee not found"}

    db.delete(employee)
    db.commit()

    return {"message": "Employee Deleted Successfully"}
# -----------------------------------
# CREATE TICKET WITH FILE UPLOAD
# -----------------------------------
@app.post("/create-ticket")
async def create_ticket(
    client_id: int = Form(...),
    issue: str = Form(...),
    priority: str = Form(...),
    assigned_to: str = Form("Auto")
):

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

    # MANUAL ASSIGN
    if assigned_to != "Auto":
        assigned_employee = db.query(Employee).filter(
            Employee.name == assigned_to
        ).first()

        if not assigned_employee:
            return {"error": "Selected employee not found"}

    # AUTO ROUND ROBIN
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


# -----------------------------------
# GET ALL TICKETS
# -----------------------------------
@app.get("/tickets")
def get_tickets():

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
def get_employee_tickets(employee_name: str):

    tickets = db.query(Ticket).filter(
        Ticket.assigned_to.ilike(employee_name)
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
            "assigned_to": t.assigned_to
        })

    return data

# -----------------------------------
# DELETE TICKET / TASKtoday = datetime.now().date()today = datetime.now().date()
# -----------------------------------
@app.delete("/delete-ticket/{ticket_id}")
def delete_ticket(ticket_id: int):

    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        return {
            "error": "Ticket not found"
        }

    db.delete(ticket)
    db.commit()

    return {
        "message": "Ticket Deleted Successfully"
    }

# -----------------------------------
# UPDATE TICKET STATUS
# -----------------------------------
@app.put("/update-ticket-status/{ticket_id}")
def update_ticket_status(
    ticket_id: int,
    status: str
):

    ticket = db.query(Ticket).filter(
        Ticket.id == ticket_id
    ).first()

    if not ticket:
        return {
            "error": "Ticket not found"
        }

    # Prevent completed ticket from changing again
    if ticket.status == "Completed":
        return {
            "error": "Completed ticket cannot be changed again"
        }

    # Open ticket can only move to In Progress
    if ticket.status == "Open" and status != "In Progress":
        return {
            "error": "Open ticket can only move to In Progress"
        }

    # In Progress ticket can only move to Completed
    if ticket.status == "In Progress" and status != "Completed":
        return {
            "error": "In Progress ticket can only move to Completed"
        }

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

# -----------------------------------
# TICKET CHAT
# -----------------------------------

@app.post("/ticket-chat")
def send_ticket_chat(
    ticket_id: int,
    sender_name: str,
    message: str
):

    chat = TicketChat(
        ticket_id=ticket_id,
        sender_name=sender_name,
        message=message,
        created_at=str(datetime.now())
    )

    db.add(chat)
    db.commit()

    return {
        "message": "Chat Message Sent Successfully"
    }


@app.get("/ticket-chat/{ticket_id}")
def get_ticket_chat(ticket_id: int):

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
# Daily Reports
# -----------------------------------


@app.get("/daily-report")
def daily_report():

    today = datetime.now().date()
    from datetime import timedelta

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
def get_ticket_history(ticket_id: int):

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