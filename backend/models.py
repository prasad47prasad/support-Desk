from sqlalchemy import Column, Integer, String, Text
from database import Base


# -----------------------------
# EMPLOYEE TABLE
# -----------------------------
class Employee(Base):

    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(String(100), unique=True)

    name = Column(String(255))

    role = Column(String(100))

    password = Column(String(255))


# -----------------------------
# CLIENT TABLE
# -----------------------------
class Client(Base):

    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)

    client_name = Column(String(255), unique=True)

    whatsapp_group_link = Column(Text)

    contact_person = Column(String(255))

    mobile_number = Column(String(20))


# -----------------------------
# TICKET TABLE
# -----------------------------
class Ticket(Base):

    __tablename__ = "tickets"
    
    id = Column(Integer, primary_key=True, index=True)

    client_id = Column(Integer)

    issue = Column(Text)

    priority = Column(String(50), default="Medium")

    status = Column(String(50), default="Open")

    assigned_to = Column(String(255))

    attachment = Column(Text, nullable=True)

    comments = Column(Text, nullable=True)

    created_at = Column(String(100))

    completed_at = Column(String(100), nullable=True)


# -----------------------------
# TICKET HISTORY TABLE
# -----------------------------
class TicketHistory(Base):

    __tablename__ = "ticket_history"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(Integer)

    action = Column(Text)

    performed_by = Column(String(255))

    created_at = Column(String(100))


# -----------------------------
# TICKET CHAT TABLE
# -----------------------------
class TicketChat(Base):

    __tablename__ = "ticket_chat"

    id = Column(Integer, primary_key=True, index=True)

    ticket_id = Column(Integer)

    sender_name = Column(String(255))

    message = Column(Text)

    created_at = Column(String(100))