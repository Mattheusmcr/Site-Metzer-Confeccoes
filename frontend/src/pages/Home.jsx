import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const heroImages = [
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1600",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600",
];

const GALERIA_KEY = "metzker_galeria_trabalhos";

const GALERIA_PADRAO = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800",
  "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?q=80&w=800",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800",
  "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=800",
];

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
};

function Divisor() {
  return <div style={{ borderTop: "2px solid " + t.borderForte }} />;
}

function Home() {
  const [heroAtual, setHeroAtual] = useState(0);
  const [galeriaIndex, setGaleriaIndex] = useState(0);
  const [galeria, setGaleria] = useState(() => {
    try {
      const salvo = localStorage.getItem(GALERIA_KEY);
      return salvo ? JSON.parse(salvo) : GALERIA_PADRAO;
    } catch { return GALERIA_PADRAO; }
  });

  useEffect(() => {
    const timer = setInterval(() => setHeroAtual(c => (c + 1) % heroImages.length), 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === GALERIA_KEY && e.newValue) {
        try { setGaleria(JSON.parse(e.newValue)); } catch {}
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const FOTOS_POR_SLIDE = 3;
  const totalSlides = Math.ceil(galeria.length / FOTOS_POR_SLIDE);

  return (
    <div style={{ backgroundColor: t.bg, color: t.text }}>

      {/*
      ══════════════════════════════════════════════════════════════
      SEÇÃO HERO (carrossel de imagens com título) — COMENTADA
      Para reativar: remova este bloco de comentário
      ══════════════════════════════════════════════════════════════

      <section className="h-screen flex flex-col justify-center items-center text-center relative overflow-hidden"
        style={{ backgroundImage: `url(${heroImages[heroAtual]})`, backgroundSize: "cover", backgroundPosition: "center", transition: "background-image 0.8s ease" }}>
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(0,0,0,0.52)" }} />
        <div className="relative z-10 px-6">
          <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>Metzker Confecções</p>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">Veste quem tem estilo.</h1>
          <p className="text-lg mb-10 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.8)" }}>
            Moda com identidade, qualidade e estilo para quem veste atitude.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/catalogo" className="px-8 py-3 font-semibold transition hover:opacity-80"
              style={{ backgroundColor: "#ffffff", color: "#1a1a1a" }}>Ver Catálogo</Link>
            <a href="https://wa.me/5527997878391" target="_blank" rel="noreferrer"
              className="px-8 py-3 font-semibold transition hover:bg-white hover:text-black"
              style={{ border: "1px solid white", color: "white" }}>WhatsApp</a>
          </div>
        </div>
        <div className="absolute bottom-8 flex gap-3 z-10">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setHeroAtual(i)} style={{
              width: "8px", height: "8px", borderRadius: "50%", border: "none", cursor: "pointer",
              backgroundColor: i === heroAtual ? "white" : "rgba(255,255,255,0.35)",
              transform: i === heroAtual ? "scale(1.4)" : "scale(1)", transition: "all 0.3s",
            }} />
          ))}
        </div>
      </section>

      <Divisor />
      */}

      {/* ── SOBRE ── */}
      <section className="py-20 px-10 text-center" style={{ backgroundColor: t.bgSecundario }}>
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: t.textSecundario }}>Quem Somos</p>
        <h2 className="text-4xl font-bold mb-6" style={{ color: t.text }}>Sobre Nós</h2>
        <p className="max-w-3xl mx-auto text-lg leading-relaxed" style={{ color: t.textSecundario }}>
          Somos uma empresa familiar localizada em Vila Velha, especializada em confecções de alta qualidade.
          Trabalhamos com dedicação, atenção aos detalhes e compromisso com a satisfação dos nossos clientes.
        </p>
      </section>

      {/*
      ══════════════════════════════════════════════════════════════
      SEÇÃO "NOSSA HISTÓRIA" COM LINHA DO TEMPO — COMENTADA
      Para reativar: remova o bloco de comentário JSX abaixo
      ══════════════════════════════════════════════════════════════

      <Divisor />
      <section className="py-24 px-10" style={{ backgroundColor: t.bgSecundario }}>
        ... (seção completa com timeline, números e foto) ...
      </section>
      */}

      <Divisor />

      {/* ── PORTFÓLIO ── */}
      <section className="py-24 px-10" style={{ backgroundColor: t.bg }}>
        <p className="text-xs uppercase tracking-widest text-center mb-3" style={{ color: t.textSecundario }}>Portfólio</p>
        <h2 className="text-4xl font-bold text-center mb-16" style={{ color: t.text }}>Nossos Trabalhos</h2>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3" style={{ gap: "20px" }}>
            {galeria.slice(galeriaIndex * FOTOS_POR_SLIDE, galeriaIndex * FOTOS_POR_SLIDE + FOTOS_POR_SLIDE).map((url, i) => (
              <div key={i} className="overflow-hidden"
                style={{ border: "2px solid " + t.borderForte, height: "300px" }}>
                <img src={url} alt={`Trabalho ${i + 1}`}
                  className="w-full h-full object-cover transition duration-500 hover:scale-105" />
              </div>
            ))}
          </div>

          {totalSlides > 1 && (
            <div className="flex items-center justify-center gap-6 mt-10">
              <button onClick={() => setGaleriaIndex(i => i > 0 ? i - 1 : totalSlides - 1)}
                className="w-10 h-10 flex items-center justify-center font-bold text-xl transition hover:opacity-60"
                style={{ border: "1px solid " + t.borderForte, color: t.text, backgroundColor: t.bg }}>‹</button>
              <div className="flex gap-2">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <button key={i} onClick={() => setGaleriaIndex(i)} style={{
                    width: "8px", height: "8px", borderRadius: "50%", border: "none", cursor: "pointer",
                    backgroundColor: i === galeriaIndex ? t.text : t.border, transition: "all 0.3s",
                  }} />
                ))}
              </div>
              <button onClick={() => setGaleriaIndex(i => i < totalSlides - 1 ? i + 1 : 0)}
                className="w-10 h-10 flex items-center justify-center font-bold text-xl transition hover:opacity-60"
                style={{ border: "1px solid " + t.borderForte, color: t.text, backgroundColor: t.bg }}>›</button>
            </div>
          )}
        </div>
      </section>

      <Divisor />

      {/* ── RODAPÉ ── */}
      <footer className="py-16 px-10" style={{ backgroundColor: t.bgSecundario }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-sm">
          <div style={{ borderRight: "1px solid " + t.border, paddingRight: "40px" }}>
            <h3 className="font-semibold mb-4 text-xs uppercase tracking-widest" style={{ color: t.text }}>
              Metzker Têxtil e Comunicações Visuais
            </h3>
            <p style={{ color: t.textSecundario }}>Peças de alta qualidade focadas em conforto, estilo e durabilidade.</p>
          </div>
          <div style={{ borderRight: "1px solid " + t.border, paddingRight: "40px" }}>
            <h3 className="font-semibold mb-4 text-xs uppercase tracking-widest" style={{ color: t.text }}>Contato</h3>
            <p style={{ color: t.textSecundario }}>WhatsApp</p>
            <p style={{ color: t.text }}>(27) 99885-3043</p>
            <p className="mt-2" style={{ color: t.textSecundario }}>Email</p>
            <p style={{ color: t.text }}>contato@metzker.com</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-xs uppercase tracking-widest" style={{ color: t.text }}>Localização</h3>
            <p style={{ color: t.text }}>Rua Tobias Barreto, 37</p>
            <p style={{ color: t.text }}>Vila Velha - ES</p>
          </div>
        </div>
        <div style={{ borderTop: "1px solid " + t.borderForte, marginTop: "48px", paddingTop: "24px" }}>
          <p className="text-center text-xs" style={{ color: t.textSecundario }}>
            &copy; {new Date().getFullYear()} Metzker Têxtil e Comunicações Visuais
          </p>
        </div>
      </footer>

      <a href="https://wa.me/5527997878391" target="_blank" rel="noreferrer"
        className="fixed bottom-6 right-6 text-white px-5 py-3 rounded-full shadow-xl font-medium z-40 hover:opacity-90 transition"
        style={{ backgroundColor: "#22c55e" }}>WhatsApp</a>
    </div>
  );
}

export default Home;