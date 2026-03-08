import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const t = {
  bg: "#FAF8F5", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#E8E0D5", inputBorder: "#D5CBC0",
  btnBg: "#1a1a1a", btnText: "#FAF8F5",
};

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
      navigate("/admin");
    } catch {
      setErro("Usuário ou senha inválidos, ou sem permissão de admin.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: t.bg }}>
      <div className="w-full max-w-sm p-10 rounded-2xl shadow-sm"
        style={{ backgroundColor: t.bgCard, border: "1px solid " + t.border }}>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: t.text }}>
            METZKER
          </h1>
          <p className="text-sm mt-1" style={{ color: t.textSecundario }}>
            Acesso Administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: t.textSecundario }}>Usuário</label>
            <input
              type="text"
              placeholder="seu_usuario"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                border: "1px solid " + t.inputBorder, backgroundColor: "#FFFFFF",
                color: t.text, fontSize: "14px", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: t.textSecundario }}>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                border: "1px solid " + t.inputBorder, backgroundColor: "#FFFFFF",
                color: t.text, fontSize: "14px", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {erro && (
            <p className="text-sm text-center" style={{ color: "#dc2626" }}>{erro}</p>
          )}

          <button type="submit"
            className="w-full py-3 rounded-lg font-semibold mt-2 transition hover:opacity-80"
            style={{ backgroundColor: t.btnBg, color: t.btnText }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;