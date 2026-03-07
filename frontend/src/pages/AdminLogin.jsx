import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [erro, setErro] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");
    try {
      const res = await api.post("admin-login/", form);
      login(res.data.access);
      navigate("/admin-produto");
    } catch (err) {
      setErro("Usuário ou senha inválidos, ou sem permissão de admin.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-10 shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Acesso Administrativo
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Usuário"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="border p-2"
          />
          <input
            type="password"
            placeholder="Senha"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border p-2"
          />
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <button className="bg-black text-white py-2">
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;