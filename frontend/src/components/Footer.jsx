import { Link } from "react-router-dom";
import { WhatsAppIcon, MailIcon, PinIcon } from "./Icons";

const t = {
  bg: "#FFFFFF",
  text: "#161513", textSecundario: "#8A877F",
  border: "rgba(0,0,0,0.08)", accent: "#C2660A",
};

export default function Footer({ completo = true }) {
  return (
    <footer style={{ backgroundColor: t.bg, borderTop: "1px solid " + t.border, fontFamily: "Manrope, sans-serif" }}>
      {completo && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-4 md:gap-8 px-6 md:px-16 py-8 md:py-10">
          <div className="col-span-2 md:col-span-1 md:border-r md:pr-8" style={{ borderColor: t.border }}>
            <h3 className="mb-1.5 uppercase" style={{ fontSize: "10px", letterSpacing: "0.15em", fontWeight: 700, color: t.text }}>
              Metzker Soluções
            </h3>
            <p style={{ color: t.textSecundario, lineHeight: 1.5, fontSize: "12.5px" }}>
              Soluções completas com foco em qualidade, resistência e prazo.
            </p>
          </div>
          <div className="md:border-r md:pr-8" style={{ borderColor: t.border }}>
            <h3 className="mb-1.5 uppercase" style={{ fontSize: "10px", letterSpacing: "0.15em", fontWeight: 700, color: t.text }}>Contato</h3>
            <p className="flex items-center gap-1.5" style={{ color: t.text, fontWeight: 600, fontSize: "12.5px" }}>
              <WhatsAppIcon size={12} strokeWidth={1.8} style={{ color: "#25D366", flexShrink: 0 }} /> (27) 99787-8391
            </p>
            <p className="flex items-center gap-1.5 mt-1" style={{ color: t.text, fontWeight: 600, fontSize: "12.5px" }}>
              <MailIcon size={12} strokeWidth={1.8} style={{ color: t.textSecundario, flexShrink: 0 }} /> andremetzkrr@gmail.com
            </p>
          </div>
          <div>
            <h3 className="mb-1.5 uppercase" style={{ fontSize: "10px", letterSpacing: "0.15em", fontWeight: 700, color: t.text }}>Localização</h3>
            <p className="flex items-center gap-1.5" style={{ color: t.text, fontWeight: 600, fontSize: "12.5px" }}>
              <PinIcon size={12} strokeWidth={1.8} style={{ color: t.textSecundario, flexShrink: 0 }} /> Polo Têxtil Santa Inês
            </p>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row items-center justify-between gap-1.5 px-6 md:px-16 py-3"
        style={{ borderTop: completo ? "1px solid " + t.border : "none", fontSize: "11.5px", color: t.textSecundario }}>
        <div>&copy; {new Date().getFullYear()} Metzker Soluções</div>
        <div className="flex items-center gap-4">
          {completo && <Link to="/admin-login" style={{ color: t.textSecundario }} className="hover:opacity-70 transition">Área administrativa</Link>}
          <span>
            Desenvolvido por{" "}
            <a href="https://github.com/Mattheusmcr" target="_blank" rel="noreferrer"
              style={{ color: t.text, fontWeight: 600, textDecoration: "none", borderBottom: "1px solid " + t.border }}>
              Matheus Costa Rodrigues
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
