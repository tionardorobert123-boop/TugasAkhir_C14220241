import { useState } from "react";
import axios from "axios";
import logo from "../assets/logo.png";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:8000/api/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("role", res.data.user.user_role);

      window.location.href = "/dashboard";
    } catch (err) {
      alert("Login gagal");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-b from-black to-yellow-900">

      {/* ================= CARD ================= */}
      <form
        onSubmit={login}
        className="relative backdrop-blur-md bg-white/10 border border-white/20 p-8 rounded-2xl shadow-xl w-80 overflow-hidden"
      >

        {/* LOGO OVERLAY */}
        <img
          src={logo}
          alt="logo"
          className="absolute top-1/2 left-1/2 w-80 -translate-x-1/2 -translate-y-1/2 opacity-10 pointer-events-none"
        />

        {/* CONTENT */}
        <div className="relative z-10">

          <h1 className="text-2xl font-bold mb-6 text-center text-white">
            FRIENDSHIP KARAOKE & PUB
          </h1>

          <input
            type="email"
            placeholder="Email"
            className="w-full mb-4 p-2 rounded-lg bg-white/80 text-black placeholder-gray-500 focus:outline-none"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 p-2 rounded-lg bg-white/80 text-black placeholder-gray-500 focus:outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="submit"
            className="w-full bg-yellow-600/80 text-white py-2 rounded-lg hover:bg-yellow-500 transition"
          >
            Login
          </button>

        </div>

      </form>

    </div>
  );
}

export default Login;