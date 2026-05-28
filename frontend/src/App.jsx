import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://support-desk-backend-n469.onrender.com";

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [activePage, setActivePage] = useState("dashboard");

  const [employees, setEmployees] = useState([]);
  const [clients, setClients] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [dailyReport, setDailyReport] = useState({
  today_total_tasks: 0,
  today_completed: 0,
  today_pending: 0,
  old_pending: 0,
});
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [ticketChats, setTicketChats] = useState([]);
  const [chatMessage, setChatMessage] = useState("");

  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [employeeId, setEmployeeId] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [employeeRole, setEmployeeRole] = useState("");
  const [employeePassword, setEmployeePassword] = useState("");

  const [clientName, setClientName] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");

  const [selectedClientId, setSelectedClientId] = useState("");
  const [issue, setIssue] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [selectedEmployee, setSelectedEmployee] = useState("Auto");

  const [employeeSearch, setEmployeeSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [ticketSearch, setTicketSearch] = useState("");

const [showResetModal, setShowResetModal] = useState(false);
const [showHistoryModal, setShowHistoryModal] = useState(false);
const [ticketHistory, setTicketHistory] = useState([]);
const [resetEmployeeId, setResetEmployeeId] = useState("");
const [newPassword, setNewPassword] = useState("");

const [showEmployeeEditModal, setShowEmployeeEditModal] = useState(false);
const [editEmployeeId, setEditEmployeeId] = useState("");
const [editEmployeeName, setEditEmployeeName] = useState("");
const [editEmployeeRole, setEditEmployeeRole] = useState("");

const [showClientEditModal, setShowClientEditModal] = useState(false);
const [editClientId, setEditClientId] = useState("");
const [editClientName, setEditClientName] = useState("");
const [editWhatsappLink, setEditWhatsappLink] = useState("");
const [editContactPerson, setEditContactPerson] = useState("");
const [editMobileNumber, setEditMobileNumber] = useState("");
const isAdmin = user?.role?.trim().toLowerCase() === "admin";
  console.log("Logged user:", user);
  console.log("Is Admin:", isAdmin);

  const fetchData = async () => {
    try {
      const empRes = await axios.get(`${API}/employees`);
      const clientRes = await axios.get(`${API}/clients`);
      const reportRes = await axios.get(`${API}/daily-report`);

      let ticketRes;

      if (user?.role?.toLowerCase() === "admin") {
        ticketRes = await axios.get(`${API}/tickets`);
      } else if (user) {
        ticketRes = await axios.get(`${API}/employee-tickets/${user.name}`);
      }

      setEmployees(empRes.data);
      setClients(clientRes.data);
      setDailyReport(reportRes.data);

      if (ticketRes) {
        setTickets(ticketRes.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const login = async () => {
    try {
      const res = await axios.post(`${API}/login`, null, {
        params: {
          employee_id: loginId,
          password: loginPassword,
        },
      });

      if (res.data.error) {
        alert(res.data.error);
        return;
      }

      localStorage.setItem("user", JSON.stringify(res.data));
      setUser(res.data);
    } catch (error) {
      alert("Login failed. Check backend is running.");
    }
  };

 const addEmployee = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(`${API}/add-employee`, null, {
      params: {
        employee_id: employeeId,
        name: employeeName,
        role: employeeRole,
        password: employeePassword,
      },
    });

    console.log("Add Employee Response:", res.data);

    if (res.data.error) {
      alert(res.data.error);
      return;
    }

    alert("Employee added successfully");

    setEmployeeId("");
    setEmployeeName("");
    setEmployeeRole("");
    setEmployeePassword("");

    await fetchData();
  } catch (error) {
    console.log("Add Employee Error:", error);
    alert("Employee not added. Check backend / console.");
  }
};


const updateEmployee = async () => {

  const res = await axios.put(
    `${API}/update-employee/${editEmployeeId}`,
    null,
    {
      params: {
        name: editEmployeeName,
        role: editEmployeeRole,
      },
    }
  );

  if (res.data.error) {
    alert(res.data.error);
    return;
  }

  alert("Employee updated successfully");

  setShowEmployeeEditModal(false);

  fetchData();
};

const deleteEmployee = async (employeeId) => {

  const confirmDelete = window.confirm(
    "Delete this employee?"
  );

  if (!confirmDelete) {
    return;
  }

  const res = await axios.delete(
    `${API}/delete-employee/${employeeId}`
  );

  if (res.data.error) {
    alert(res.data.error);
    return;
  }

  alert("Employee deleted successfully");

  fetchData();
};
  
const resetPassword = async () => {
  try {
    if (!resetEmployeeId) {
      alert("Employee ID missing");
      return;
    }

    if (!newPassword) {
      alert("Enter new password");
      return;
    }

    const res = await axios.put(`${API}/reset-password`, null, {
      params: {
        employee_id: resetEmployeeId,
        new_password: newPassword,
      },
    });

    if (res.data.error) {
      alert(res.data.error);
      return;
    }

    alert("Password reset successfully");

    setShowResetModal(false);
    setResetEmployeeId("");
    setNewPassword("");

    fetchData();
  } catch (error) {
    console.log("Reset password error:", error);
    alert("Password reset failed");
  }
};

  const addClient = async (e) => {
    e.preventDefault();

    const res = await axios.post(`${API}/add-client`, null, {
      params: {
        client_name: clientName,
        whatsapp_group_link: whatsappLink,
        contact_person: contactPerson,
        mobile_number: mobileNumber,
      },
    });

    if (res.data.error) {
      alert(res.data.error);
      return;
    }

    alert("Client added successfully");

    setClientName("");
    setWhatsappLink("");
    setContactPerson("");
    setMobileNumber("");

    fetchData();
  };

  const openEditClientModal = (client) => {
    setEditClientId(client.id);
    setEditClientName(client.client_name);
    setEditWhatsappLink(client.whatsapp_group_link);
    setEditContactPerson(client.contact_person);
    setEditMobileNumber(client.mobile_number);
    setShowClientEditModal(true);
  };

  const updateClient = async () => {
    const res = await axios.put(`${API}/update-client/${editClientId}`, null, {
      params: {
        client_name: editClientName,
        whatsapp_group_link: editWhatsappLink,
        contact_person: editContactPerson,
        mobile_number: editMobileNumber,
      },
    });

    if (res.data.error) {
      alert(res.data.error);
      return;
    }

    alert("Client updated successfully");

    setShowClientEditModal(false);
    fetchData();
  };

  const createTicket = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("client_id", selectedClientId);
    formData.append("issue", issue);
    formData.append("priority", priority);
    formData.append("assigned_to", selectedEmployee);

    const res = await axios.post(`${API}/create-ticket`, formData);

    if (res.data.error) {
      alert(res.data.error);
      return;
    }

    alert("Ticket created successfully");

    setSelectedClientId("");
    setIssue("");
    setPriority("Medium");
    setSelectedEmployee("Auto");

    fetchData();
  };

  const updateStatus = async (id, status) => {
    const viewHistory = async (ticketId) => {

  try {

    const res = await axios.get(
      `${API}/ticket-history/${ticketId}`
    );

    const openChat = async (ticketId) => {
  setSelectedTicketId(ticketId);

  const res = await axios.get(`${API}/ticket-chat/${ticketId}`);

  setTicketChats(res.data);

  setShowChatModal(true);
  };

const sendChatMessage = async () => {
  if (!chatMessage.trim()) {
    alert("Enter message");
    return;
  }

  await axios.post(`${API}/ticket-chat`, null, {
    params: {
      ticket_id: selectedTicketId,
      sender_name: user.name,
      message: chatMessage,
    },
  });

  setChatMessage("");

  const res = await axios.get(`${API}/ticket-chat/${selectedTicketId}`);
  setTicketChats(res.data);
  };


    setTicketHistory(res.data);

    setShowHistoryModal(true);

  } catch (error) {

    console.log(error);

    alert("Failed to load history");

  }

};
    await axios.put(`${API}/update-ticket-status/${id}`, null, {
      params: { status },
    });

    fetchData();
  };
  const openChat = async (ticketId) => {
  try {
    setSelectedTicketId(ticketId);

    const res = await axios.get(`${API}/ticket-chat/${ticketId}`);

    setTicketChats(res.data);

    setShowChatModal(true);
  } catch (error) {
    console.log(error);
    alert("Failed to open chat");
  }
};

const sendChatMessage = async () => {
  if (!chatMessage.trim()) {
    alert("Enter message");
    return;
  }

  await axios.post(`${API}/ticket-chat`, null, {
    params: {
      ticket_id: selectedTicketId,
      sender_name: user.name,
      message: chatMessage,
    },
  });

  setChatMessage("");

  const res = await axios.get(`${API}/ticket-chat/${selectedTicketId}`);
  setTicketChats(res.data);
};

const viewHistory = async (ticketId) => {
  try {
    const res = await axios.get(`${API}/ticket-history/${ticketId}`);

    setTicketHistory(res.data);

    setShowHistoryModal(true);
  } catch (error) {
    console.log(error);
    alert("Failed to load history");
  }
};

  const deleteTicket = async (id) => {
    if (!window.confirm("Delete this ticket?")) {
      return;
    }

    await axios.delete(`${API}/delete-ticket/${id}`);
    fetchData();
  };

  const filteredEmployees = employees.filter((emp) => {
    const text = employeeSearch.toLowerCase();

    return (
      emp.employee_id.toLowerCase().includes(text) ||
      emp.name.toLowerCase().includes(text) ||
      emp.role.toLowerCase().includes(text)
    );
  });

  const filteredClients = clients.filter((client) => {
    const text = clientSearch.toLowerCase();

    return (
      client.client_name.toLowerCase().includes(text) ||
      client.contact_person.toLowerCase().includes(text) ||
      client.mobile_number.toLowerCase().includes(text)
    );
  });

  const filteredTickets = tickets.filter((ticket) => {
    const text = ticketSearch.toLowerCase();

    return (
      ticket.client_name.toLowerCase().includes(text) ||
      ticket.issue.toLowerCase().includes(text) ||
      ticket.assigned_to.toLowerCase().includes(text) ||
      ticket.priority.toLowerCase().includes(text) ||
      ticket.status.toLowerCase().includes(text)
    );
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-700 via-indigo-800 to-slate-900 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-4xl font-black text-center text-slate-800 mb-2">
            Support Desk
          </h1>

          <p className="text-center text-slate-500 mb-8">
            Office Ticket Management Login
          </p>

          <input
            className="w-full border rounded-2xl p-4 mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Employee ID"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
          />

          <input
            type="password"
            className="w-full border rounded-2xl p-4 mb-6 outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
          />

          <button
            onClick={login}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl p-4 font-bold"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <aside className="w-72 bg-slate-950 text-white p-6 min-h-screen">
        <h1 className="text-3xl font-black text-blue-400 mb-10">
          Support Desk
        </h1>

        {["dashboard", "tickets", "clients", "employees", "reports"].map(
          (page) =>
            (isAdmin || page === "dashboard" || page === "tickets") && (
              <button
                key={page}
                onClick={() => setActivePage(page)}
                className={`w-full text-left capitalize p-4 mb-3 rounded-2xl transition-all ${
                  activePage === page
                    ? "bg-blue-600 shadow-lg"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {page}
              </button>
            )
        )}
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800">
              Welcome, {user.name}
            </h2>
            <p className="text-slate-500">Role: {user.role}</p>
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("user");
              setUser(null);
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-2xl font-bold"
          >
            Logout
          </button>
        </div>

        {activePage === "dashboard" && (
  <Section title="Dashboard Overview">

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

      <Card
        title="Total Employees"
        value={employees.length}
        color="blue"
      />

      <Card
        title="Total Clients"
        value={clients.length}
        color="green"
      />

      <Card
        title="Total Tickets"
        value={tickets.length}
        color="purple"
      />

      <Card
        title="Open Tickets"
        value={
          tickets.filter(
            (t) => t.status !== "Completed"
          ).length
        }
        color="red"
      />

      <Card
        title="Today Tasks"
        value={dailyReport.today_total_tasks}
        color="purple"
      />

      <Card
        title="Today Completed"
        value={dailyReport.today_completed}
        color="green"
      />

      <Card
        title="Today Pending"
        value={dailyReport.today_pending}
        color="yellow"
      />

      <Card
        title="Yesterday Pending"
        value={dailyReport.yesterday_pending}
        color="red"
      />

      <Card
        title="Old Pending"
        value={dailyReport.old_pending}
        color="red"
      />

    </div>

  </Section>
)}

        {activePage === "employees" && isAdmin && (
          <Section title="Employees">
            <form onSubmit={addEmployee} className="grid md:grid-cols-5 gap-4 mb-6">
              <Input placeholder="Employee ID" value={employeeId} setValue={setEmployeeId} />
              <Input placeholder="Name" value={employeeName} setValue={setEmployeeName} />
              <Input placeholder="Role" value={employeeRole} setValue={setEmployeeRole} />
              <Input
                type="password"
                placeholder="Password"
                value={employeePassword}
                setValue={setEmployeePassword}
              />
              <Button text="Add Employee" color="blue" />
            </form>

            <input
              className="w-full border rounded-2xl p-3 mb-6 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Search employee by ID, name, or role..."
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
            />

            <div className="grid md:grid-cols-3 gap-4">
              {filteredEmployees.map((emp) => (
                <div
                  key={emp.id}
                  className="border rounded-2xl p-5 bg-white hover:shadow-lg transition-all"
                >
                  <p className="text-blue-600 font-bold">{emp.employee_id}</p>
                  <h3 className="text-xl font-bold">{emp.name}</h3>
                  <p className="text-slate-500">{emp.role}</p>
                  
                  <button
                    onClick={() => {

                      setEditEmployeeId(emp.employee_id);

                      setEditEmployeeName(emp.name);

                      setEditEmployeeRole(emp.role);

                      setShowEmployeeEditModal(true);

                    }}
                    className="mt-4 mr-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteEmployee(emp.employee_id)}
                    className="mt-4 mr-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-semibold"
                  >
                    Delete
                  </button>

                  <button
                  onClick={() => {
                    setResetEmployeeId(emp.employee_id);
                    setShowResetModal(true);
                  }}
                  className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl font-semibold"
                >
                  Reset Password
                </button>
                </div>
              ))}
            </div>
          </Section>
        )}

        {activePage === "clients" && isAdmin && (
          <Section title="Clients">
            <form onSubmit={addClient} className="grid md:grid-cols-5 gap-4 mb-6">
              <Input placeholder="Client Name" value={clientName} setValue={setClientName} />
              <Input
                placeholder="WhatsApp Group Link"
                value={whatsappLink}
                setValue={setWhatsappLink}
              />
              <Input
                placeholder="Contact Person"
                value={contactPerson}
                setValue={setContactPerson}
              />
              <Input
                placeholder="Mobile Number"
                value={mobileNumber}
                setValue={setMobileNumber}
              />
              <Button text="Add Client" color="green" />
            </form>

            <input
              className="w-full border rounded-2xl p-3 mb-6 outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Search client by name, contact person, or mobile..."
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
            />

            <div className="grid md:grid-cols-3 gap-4">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="border rounded-2xl p-5 bg-white hover:shadow-lg transition-all"
                >
                  <h3 className="text-xl font-bold">{client.client_name}</h3>
                  <p className="text-slate-600">Contact: {client.contact_person}</p>
                  <p className="text-slate-500">Mobile: {client.mobile_number}</p>

                  <a
                    href={client.whatsapp_group_link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-green-600 underline block mt-2"
                  >
                    Open WhatsApp
                  </a>

                  <button
                    onClick={() => openEditClientModal(client)}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold"
                  >
                    Edit Client
                  </button>
                </div>
              ))}
            </div>
          </Section>
        )}

        {activePage === "tickets" && (
          <Section title={isAdmin ? "All Tickets" : "My Tickets"}>
            {isAdmin && (
              <form onSubmit={createTicket} className="grid md:grid-cols-5 gap-4 mb-6">
                <select
                  className="border rounded-2xl p-3"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  required
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.client_name}
                    </option>
                  ))}
                </select>

                <Input placeholder="Issue" value={issue} setValue={setIssue} />

                <select
                  className="border rounded-2xl p-3"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>

                <select
                  className="border rounded-2xl p-3"
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="Auto">Auto Assign</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name}
                    </option>
                  ))}
                </select>

                <Button text="Create Ticket" color="purple" />
              </form>
            )}

            {isAdmin && (
              <input
                className="w-full border rounded-2xl p-3 mb-6 outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Search ticket by client, issue, employee, priority, or status..."
                value={ticketSearch}
                onChange={(e) => setTicketSearch(e.target.value)}
              />
            )}

            <div className="overflow-x-auto">
              <table className="w-full bg-white">
                <thead className="bg-slate-200">
                  <tr>
                    <th className="p-3 text-left">Client</th>
                    <th className="p-3 text-left">Issue</th>
                    <th className="p-3 text-left">Priority</th>
                    <th className="p-3 text-left">Assigned</th>
                    <th className="p-3 text-left">WhatsApp</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="border-b hover:bg-slate-50">
                      <td className="p-3 font-bold">{ticket.client_name}</td>
                      <td className="p-3">{ticket.issue}</td>
                      <td className="p-3">
                        <Badge text={ticket.priority} />
                      </td>
                      <td className="p-3">{ticket.assigned_to}</td>
                      <td className="p-3">
                        <a
                          href={ticket.whatsapp_group_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-green-600 underline"
                        >
                          Open
                        </a>
                      </td>
                      <td className="p-3">
                        <Badge text={ticket.status} />
                      </td>
                      <td className="p-3 flex gap-2">
                        {ticket.status === "Open" && (
                          <button
                            onClick={() => updateStatus(ticket.id, "In Progress")}
                            className="bg-yellow-500 text-white px-3 py-1 rounded-xl"
                          >
                            Start
                          </button>
                        )}
                        <button
                          onClick={() => openChat(ticket.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-xl"
                        >
                          Chat
                        </button>

                        {ticket.status === "In Progress" && (
                          <button
                            onClick={() => updateStatus(ticket.id, "Completed")}
                            className="bg-green-600 text-white px-3 py-1 rounded-xl"
                          >
                            Done
                          </button>                         
                        )}

                        {ticket.status === "Completed" && (
                          <span className="text-green-600 font-bold">
                            Completed
                          </span>
                        )}

                        {isAdmin && (
                          <button
                            onClick={() => deleteTicket(ticket.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-xl"
                          >
                            Delete
                          </button>
                        )}
                        <button
                          onClick={() => viewHistory(ticket.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded-xl"
                        >
                          History
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredTickets.length === 0 && (
                    <tr>
                      <td colSpan="7" className="p-6 text-center text-slate-500">
                        No tickets found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        {activePage === "reports" && isAdmin && (
          <Section title="Reports">
            <div className="grid md:grid-cols-3 gap-6">
              <Card
                title="Completed Tickets"
                value={tickets.filter((t) => t.status === "Completed").length}
                color="green"
              />

              <Card
                title="High Priority"
                value={tickets.filter((t) => t.priority === "High").length}
                color="red"
              />

              <Card
                title="Pending Tickets"
                value={tickets.filter((t) => t.status !== "Completed").length}
                color="yellow"
              />
            </div>
          </Section>
        )}

        {showHistoryModal && (
  <Modal title="Ticket History">

    <div className="space-y-4 max-h-[400px] overflow-y-auto">

      {ticketHistory.map((history) => (

        <div
          key={history.id}
          className="border-l-4 border-blue-600 bg-slate-50 p-4 rounded-xl"
        >

          <h3 className="font-bold text-lg text-slate-800">
            {history.action}
          </h3>

          <p className="text-slate-600">
            By: {history.performed_by}
          </p>

          <p className="text-slate-500 text-sm">
            {history.created_at}
          </p>

        </div>

      ))}

      {ticketHistory.length === 0 && (
        <p className="text-slate-500">
          No history found
        </p>
      )}

    </div>

    <button
      onClick={() => setShowHistoryModal(false)}
      className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl font-bold"
    >
      Close
    </button>

  </Modal>
)}

        {showResetModal && (
  <Modal title="Reset Password">
    <p className="mb-4 text-slate-600">
      Employee ID: {resetEmployeeId}
    </p>

    <Input
      type="password"
      placeholder="New Password"
      value={newPassword}
      setValue={setNewPassword}
    />

    <div className="flex gap-3 mt-5">
      <button
        onClick={resetPassword}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold"
      >
        Save
      </button>

      <button
        onClick={() => {
          setShowResetModal(false);
          setNewPassword("");
          setResetEmployeeId("");
        }}
        className="flex-1 bg-slate-300 hover:bg-slate-400 p-3 rounded-xl font-bold"
      >
        Cancel
      </button>
    </div>
  </Modal>
)}

        {showEmployeeEditModal && (

            <Modal title="Edit Employee">

              <Input
                placeholder="Employee Name"
                value={editEmployeeName}
                setValue={setEditEmployeeName}
              />

              <Input
                placeholder="Role"
                value={editEmployeeRole}
                setValue={setEditEmployeeRole}
              />

              <div className="flex gap-3 mt-5">

                <button
                  onClick={updateEmployee}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold"
                >
                  Update
                </button>

                <button
                  onClick={() =>
                    setShowEmployeeEditModal(false)
                  }
                  className="flex-1 bg-slate-300 hover:bg-slate-400 p-3 rounded-xl font-bold"
                >
                  Cancel
                </button>

              </div>

            </Modal>

          )}

        {showClientEditModal && (
          <Modal title="Edit Client">
            <Input
              placeholder="Client Name"
              value={editClientName}
              setValue={setEditClientName}
            />

            <Input
              placeholder="WhatsApp Group Link"
              value={editWhatsappLink}
              setValue={setEditWhatsappLink}
            />

            <Input
              placeholder="Contact Person"
              value={editContactPerson}
              setValue={setEditContactPerson}
            />

            <Input
              placeholder="Mobile Number"
              value={editMobileNumber}
              setValue={setEditMobileNumber}
            />

            <div className="flex gap-3 mt-5">
              <button
                onClick={updateClient}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-bold"
              >
                Update
              </button>

              <button
                onClick={() => setShowClientEditModal(false)}
                className="flex-1 bg-slate-300 hover:bg-slate-400 p-3 rounded-xl font-bold"
              >
                Cancel
              </button>
            </div>
          </Modal>
        )}
{showChatModal && (
  <Modal title={`Ticket #${selectedTicketId} Chat`}>
    <div className="h-80 overflow-y-auto bg-slate-100 rounded-2xl p-4 mb-4">
      {ticketChats.map((chat) => (
        <div key={chat.id} className="bg-white rounded-xl p-3 mb-3 shadow">
          <p className="font-bold text-blue-600">{chat.sender_name}</p>
          <p className="text-slate-700">{chat.message}</p>
          <p className="text-xs text-slate-400 mt-1">{chat.created_at}</p>
        </div>
      ))}

      {ticketChats.length === 0 && (
        <p className="text-slate-500 text-center">No messages yet</p>
      )}
    </div>

    <input
      className="w-full border rounded-2xl p-3 mb-3 outline-none"
      placeholder="Type message..."
      value={chatMessage}
      onChange={(e) => setChatMessage(e.target.value)}
    />

    <div className="flex gap-3">
      <button
        onClick={sendChatMessage}
        className="flex-1 bg-blue-600 text-white p-3 rounded-xl font-bold"
      >
        Send
      </button>

      <button
        onClick={() => setShowChatModal(false)}
        className="flex-1 bg-slate-300 p-3 rounded-xl font-bold"
      >
        Close
      </button>
    </div>
  </Modal>
)}

      </main>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
      <h2 className="text-2xl font-black mb-6 text-slate-800">{title}</h2>
      {children}
    </div>
  );
}

function Card({ title, value, color }) {
  const colors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    red: "text-red-600",
    yellow: "text-yellow-600",
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      <h3 className="text-slate-500 font-semibold">{title}</h3>
      <p className={`text-5xl font-black mt-3 ${colors[color]}`}>{value}</p>
    </div>
  );
}

function Input({ placeholder, value, setValue, type = "text" }) {
  return (
    <input
      type={type}
      className="border rounded-2xl p-3 mb-3 outline-none focus:ring-2 focus:ring-blue-500"
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      required
    />
  );
}

function Button({ text, color }) {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
  };

  return (
    <button
      className={`${colors[color]} text-white rounded-2xl p-3 font-bold shadow-lg`}
    >
      {text}
    </button>
  );
}

function Badge({ text }) {
  let color = "bg-slate-100 text-slate-700";

  if (text === "High" || text === "Open") {
    color = "bg-red-100 text-red-700";
  }

  if (text === "Medium" || text === "In Progress") {
    color = "bg-yellow-100 text-yellow-700";
  }

  if (text === "Low") {
    color = "bg-blue-100 text-blue-700";
  }

  if (text === "Completed") {
    color = "bg-green-100 text-green-700";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-bold ${color}`}>
      {text}
    </span>
  );
}
function Modal({ title, children }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h2 className="text-2xl font-black mb-6">{title}</h2>
        {children} 
      </div>
    </div>
  );
}

export default App;