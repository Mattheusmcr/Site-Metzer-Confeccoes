import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const t = {
  bg: "#FFFFFF", bgCard: "#FFFFFF",
  text: "#161513", textSecundario: "#8A877F",
  border: "rgba(0,0,0,0.08)", inputBorder: "rgba(0,0,0,0.12)",
  btnBg: "#161513", btnText: "#FFFFFF",
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
      style={{ backgroundColor: t.bg, fontFamily: "Manrope, sans-serif" }}>
      <div className="w-full max-w-sm p-10"
        style={{ backgroundColor: t.bgCard, border: "1px solid " + t.border, borderRadius: "20px" }}>

        <div className="text-center mb-8">
          <img src="/LogoEmpresaMetzker.jpg" alt="Metzker" className="h-14 mx-auto mb-5 rounded-lg object-contain"
            onError={e => { e.target.style.display = "none"; }} />
          <p className="text-sm" style={{ color: t.textSecundario }}>
            Acesso Administrativo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1.5"
              style={{ color: t.textSecundario, letterSpacing: "0.1em" }}>Usuário</label>
            <input
              type="text"
              placeholder="seu_usuario"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: "12px",
                border: "1px solid " + t.inputBorder, backgroundColor: "#FFFFFF",
                color: t.text, fontSize: "14px", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1.5"
              style={{ color: t.textSecundario, letterSpacing: "0.1em" }}>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: "12px",
                border: "1px solid " + t.inputBorder, backgroundColor: "#FFFFFF",
                color: t.text, fontSize: "14px", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>

          {erro && (
            <p className="text-sm text-center" style={{ color: "#DC2626" }}>{erro}</p>
          )}

          <button type="submit"
            className="w-full py-3.5 font-bold mt-2 transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: t.btnBg, color: t.btnText, borderRadius: "999px" }}>
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
