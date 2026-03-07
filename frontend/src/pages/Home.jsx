import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const heroImages = [
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1600",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600",
];

const diferenciais = [
  { titulo: "Alta Qualidade", texto: "Trabalhamos com tecidos selecionados e acabamento impecável." },
  { titulo: "Atendimento Personalizado", texto: "Atendimento direto pelo WhatsApp com suporte rápido." },
  { titulo: "Produção Local", texto: "Empresa localizada em Vila Velha, fortalecendo o comércio local." },
];

function Home() {
  const { dark } = useTheme();
  const [heroAtual, setHeroAtual] = useState(0);

  // Carrossel automático a cada 4 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroAtual(c => c < heroImages.length - 1 ? c + 1 : 0);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const bg = dark ? "#111827" : "#ffffff";
  const text = dark ? "#ffffff" : "#000000";
  const subtext = dark ? "#9ca3af" : "#6b7280";
  const cardBg = dark ? "#1f2937" : "#f9fafb";
  const sectionAlt = dark ? "#1f2937" : "#f3f4f6";
  const borderColor = dark ? "#374151" : "#e5e7eb";

  return (
    <div style={{ backgroundColor: bg, color: text }}>

      {/* HERO com carrossel automático */}
      <section
        className="h-screen flex flex-col justify-center items-center text-center relative overflow-hidden"
        style={{
          backgroundImage: "url(" + heroImages[heroAtual] + ")",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transition: "background-image 0.8s ease-in-out",
        }}
      >
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.55)" }} />
        <div className="relative z-10 px-6">
          <p className="text-sm uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
            METZKER TEXTIL E COMUNICAÇÃO
          </p>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Veste quem tem estilo.
          </h1>
          <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
            Moda com identidade, qualidade e estilo para quem veste atitude.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/catalogo"
              className="px-8 py-3 font-semibold transition"
              style={{ backgroundColor: "#ffffff", color: "#000000" }}>
              Ver Catálogo
            </Link>
            <a href="https://wa.me/5527997878391" target="_blank" rel="noreferrer"
              className="px-8 py-3 font-semibold transition"
              style={{ border: "1px solid white", color: "white" }}
              onMouseEnter={e => { e.target.style.backgroundColor = "white"; e.target.style.color = "black"; }}
              onMouseLeave={e => { e.target.style.backgroundColor = "transparent"; e.target.style.color = "white"; }}>
              WhatsApp
            </a>
          </div>
        </div>

        {/* DOTS */}
        <div className="absolute bottom-8 flex gap-3 z-10">
          {heroImages.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroAtual(i)}
              style={{
                width: "10px", height: "10px", borderRadius: "50%",
                backgroundColor: i === heroAtual ? "white" : "rgba(255,255,255,0.4)",
                transform: i === heroAtual ? "scale(1.3)" : "scale(1)",
                transition: "all 0.3s",
                border: "none", cursor: "pointer",
              }}
            />
          ))}
        </div>
      </section>

      {/* SOBRE */}
      <section className="py-20 px-10 text-center" style={{ backgroundColor: sectionAlt }}>
        <h2 className="text-4xl font-bold mb-6">Sobre Nós</h2>
        <p className="max-w-3xl mx-auto text-lg leading-relaxed" style={{ color: subtext }}>
          Somos uma empresa familiar localizada em Vila Velha, especializada em confecções de alta qualidade.
          Trabalhamos com dedicação, atenção aos detalhes e compromisso com a satisfação dos nossos clientes.
        </p>
      </section>

      {/* DIFERENCIAIS */}
      <section className="py-20 px-10" style={{ backgroundColor: bg }}>
        <h2 className="text-4xl font-bold text-center mb-12">Nossos Diferenciais</h2>
        <div className="grid md:grid-cols-3 gap-10 text-center max-w-5xl mx-auto">
          {diferenciais.map((d, i) => (
            <div key={i} className="p-8 rounded-2xl shadow-lg" style={{ backgroundColor: cardBg }}>
              <h3 className="text-xl font-semibold mb-4">{d.titulo}</h3>
              <p style={{ color: subtext }}>{d.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LOCALIZAÇÃO COM MAPS*/}
    {/*}  <section className="py-20 bg-gray-100 text-center px-6">
        <h2 className="text-4xl font-bold mb-8">Nossa Localização</h2>

        <p className="mb-6 text-lg text-gray-700">
          Rua Tobias Barreto, nº 37 – Vila Velha
        </p>

        <div className="flex justify-center">
          <iframe
            title="Localização Metzker"
            src="https://www.google.com/maps?q=Rua+Tobias+Barreto,+37,+Vila+Velha&output=embed"
            width="100%"
            height="400"
            className="rounded-2xl shadow-lg max-w-4xl"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </section>
    */}

      {/* RODAPÉ */}
      <footer className="py-16 px-10" style={{ borderTop: "1px solid " + borderColor, backgroundColor: bg }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-sm">
          <div>
            <h3 className="font-semibold mb-4">METZKER TEXTIL E COMUNICAÇÃO</h3>
            <p className="leading-relaxed" style={{ color: subtext }}>
              Peças de alta qualidade focadas em conforto, estilo e durabilidade.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">CONTATO</h3>
            <p style={{ color: subtext }}>WhatsApp</p>
            <p className="mb-2">(27) 99885-3043</p>
            <p style={{ color: subtext }}>Email</p>
            <p>contato@metzker.com</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">LOCALIZAÇÃO</h3>
            <p>Rua Tobias Barreto, 37</p>
            <p>Vila Velha - ES</p>
            <p>Brasil</p>
          </div>
        </div>
        <div className="text-center text-xs mt-12" style={{ color: subtext }}>
          &copy; {new Date().getFullYear()} METZKER TEXTIL E COMUNICAÇÃO
        </div>
      </footer>

      <a href="https://wa.me/5527997878391" target="_blank" rel="noreferrer"
        className="fixed bottom-6 right-6 text-white px-5 py-3 rounded-full shadow-xl font-medium z-40"
        style={{ backgroundColor: "#22c55e" }}>
        WhatsApp
      </a>
    </div>
  );
}

export default Home;