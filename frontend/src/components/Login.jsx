import { useState } from "react";
import axios from "axios";

const API = "https://support-desk-backend-n469.onrender.com";

function Login({ setUser }) {
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API}/login`, null, {
        params: {
          employee_id: employeeId,
          password: password,
        },
      });

      if (response.data.error) {
        alert(response.data.error);
        return;
      }

      localStorage.setItem("user", JSON.stringify(response.data));
      setUser(response.data);
    } catch (error) {
      alert("Login Failed");
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">
          Support System
        </h1>

        <p className="text-center text-slate-500 mb-8">Employee Login</p>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Employee ID"
            className="w-full border rounded-xl p-3 mb-4"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-xl p-3 mb-6"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="w-full bg-blue-600 text-white rounded-xl p-3 font-semibold">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;