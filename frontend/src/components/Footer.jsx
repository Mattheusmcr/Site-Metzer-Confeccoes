const t = {
  bg: "#FFFFFF", bgSecundario: "#F2F2F2", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#6b6b6b",
  border: "#E0E0E0", borderForte: "#B0B0B0",
};

function Creditos() {
  return (
    <div style={{ borderTop: "1px solid " + t.borderForte, padding: "16px 24px" }}
      className="flex flex-col md:flex-row items-center justify-between gap-2">
      <p className="text-xs" style={{ color: t.textSecundario, fontFamily: "system-ui", letterSpacing: "0.1em" }}>
        &copy; {new Date().getFullYear()} Metzker Soluções
      </p>
      <p className="text-xs" style={{ color: t.textSecundario, fontFamily: "system-ui", letterSpacing: "0.05em" }}>
        Desenvolvido por{" "}
        <a href="https://github.com/Mattheusmcr" target="_blank" rel="noreferrer"
          style={{ color: t.text, fontWeight: "600", textDecoration: "none", borderBottom: "1px solid " + t.border }}>
          Matheus Costa Rodrigues
        </a>
      </p>
    </div>
  );
}

export default function Footer({ compacto = false }) {
  // Versão compacta — usada em todas as páginas exceto a Home
  if (compacto) {
    return (
      <footer style={{ backgroundColor: t.bgSecundario, borderTop: "2px solid " + t.borderForte }}>
        <Creditos />
      </footer>
    );
  }

  // Versão completa — usada apenas na Home
  return (
    <footer style={{ backgroundColor: t.bgSecundario, borderTop: "2px solid " + t.borderForte }}>
      <div className="px-6 md:px-24 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        <div className="md:border-r md:pr-10" style={{ borderColor: t.border }}>
          <h3 className="mb-4 uppercase" style={{ fontSize: "10px", letterSpacing: "0.25em", color: t.text, fontFamily: "system-ui" }}>
            Metzker Soluções
          </h3>
          <p style={{ color: t.textSecundario, lineHeight: 1.8, fontFamily: "system-ui" }}>
            Soluções completas com foco em qualidade, resistência e prazo.
          </p>
        </div>
        <div className="md:border-r md:pr-10" style={{ borderColor: t.border }}>
          <h3 className="mb-4 uppercase" style={{ fontSize: "10px", letterSpacing: "0.25em", color: t.text, fontFamily: "system-ui" }}>Contato</h3>
          <p style={{ color: t.textSecundario, fontFamily: "system-ui" }}>WhatsApp</p>
          <p style={{ color: t.text, fontFamily: "system-ui" }}>(27) 99787-8391</p>
          <p className="mt-2" style={{ color: t.textSecundario, fontFamily: "system-ui" }}>Email</p>
          <p style={{ color: t.text, fontFamily: "system-ui" }}>andremetzkrr@gmail.com</p>
        </div>
        <div>
          <h3 className="mb-4 uppercase" style={{ fontSize: "10px", letterSpacing: "0.25em", color: t.text, fontFamily: "system-ui" }}>Localização</h3>
          <p style={{ color: t.text, fontFamily: "system-ui" }}>Polo Têxtil Santa Inês</p>
        </div>
      </div>
      <Creditos />
    </footer>
  );
}