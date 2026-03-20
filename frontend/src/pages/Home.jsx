import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const GALERIA_KEY = "metzker_galeria_trabalhos";

const GALERIA_PADRAO = [
  "/Galeria1.jpeg",
  "/Galeria2.jpeg",
  "/Galeria3.jpeg",
];

const heroImages = [
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=1600",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1600",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600",
];

const t = {
  bg: "#FAF8F5", bgSecundario: "#F2EDE6", bgCard: "#FFFFFF",
  text: "#1a1a1a", textSecundario: "#7a7065",
  border: "#D5C9BC", borderForte: "#C4B5A5",
};

function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export default function Home() {
  const [heroAtual, setHeroAtual] = useState(0);
  const [galeria, setGaleria] = useState(() => {
    try { const s = localStorage.getItem(GALERIA_KEY); return s ? JSON.parse(s) : GALERIA_PADRAO; }
    catch { return GALERIA_PADRAO; }
  });

  const [heroRef, heroVisible] = useReveal(0.01);
  const [sobreRef, sobreVisible] = useReveal();
  const [missaoRef, missaoVisible] = useReveal();
  const [galeriaRef, galeriaVisible] = useReveal();

  useEffect(() => {
    const timer = setInterval(() => setHeroAtual(c => (c + 1) % heroImages.length), 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fn = e => { if (e.key === GALERIA_KEY && e.newValue) { try { setGaleria(JSON.parse(e.newValue)); } catch {} } };
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  }, []);

  // Usa até 3 fotos — se admin tiver mais, mostra navegação
  const fotosMostradas = galeria.slice(0, 3);
  const [galeriaIndex, setGaleriaIndex] = useState(0);
  const FOTOS_POR_SLIDE = 3;
  const totalSlides = Math.ceil(galeria.length / FOTOS_POR_SLIDE);

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, fontFamily: "Georgia, serif" }}>

      {/* ══ HERO ══ */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ height: "100vh", minHeight: "600px" }}>
        {heroImages.map((img, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: heroAtual === i ? 1 : 0, backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        ))}
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(10,10,10,0.55)" }} />

        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-24"
          style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(30px)", transition: "all 1s ease 0.2s" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.5)", marginBottom: "24px", fontFamily: "system-ui" }}>
            Metzker Soluções
          </p>
          <h1 style={{ fontSize: "clamp(2.2rem, 6vw, 5.5rem)", fontWeight: "300", color: "white", lineHeight: 1.1, maxWidth: "700px", letterSpacing: "-0.01em" }}>
            Produção têxtil e<br /><em style={{ fontStyle: "italic", fontWeight: "400" }}>comunicação visual</em><br />alinhadas para fortalecer marcas.
          </h1>
          <p className="mt-6" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "480px", lineHeight: 1.8, fontFamily: "system-ui", fontSize: "15px" }}>
            Qualidade, consistência e identidade em cada entrega.
          </p>
          <div className="flex gap-4 mt-10 flex-wrap">
            <Link to="/catalogo"
              className="px-8 py-3 text-sm uppercase tracking-widest font-medium transition hover:opacity-80"
              style={{ backgroundColor: "white", color: "#1a1a1a", letterSpacing: "0.15em", fontFamily: "system-ui" }}>
              Ver Portfólio
            </Link>
            <a href="https://wa.me/5527997878391" target="_blank" rel="noreferrer"
              className="px-8 py-3 text-sm uppercase tracking-widest font-medium transition hover:bg-white hover:text-black"
              style={{ border: "1px solid rgba(255,255,255,0.6)", color: "white", letterSpacing: "0.15em", fontFamily: "system-ui" }}>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Indicadores */}
        <div className="absolute bottom-8 left-6 md:left-16 flex gap-3 z-10">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setHeroAtual(i)} style={{
              width: i === heroAtual ? "32px" : "8px", height: "2px", border: "none", cursor: "pointer",
              backgroundColor: i === heroAtual ? "white" : "rgba(255,255,255,0.35)", transition: "all 0.4s",
            }} />
          ))}
        </div>
      </section>

      {/* ══ SOBRE — MISSÃO ══ */}
      <section ref={sobreRef} style={{ backgroundColor: t.bg }}>
        {/* Título */}
        <div className="px-6 md:px-24 py-16 border-b" style={{ borderColor: t.borderForte }}>
          <div style={{ opacity: sobreVisible ? 1 : 0, transform: sobreVisible ? "translateY(0)" : "translateY(40px)", transition: "all 0.9s ease" }}>
            <p className="uppercase mb-4" style={{ fontSize: "10px", letterSpacing: "0.25em", color: t.textSecundario, fontFamily: "system-ui" }}>
              Quem somos
            </p>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: "300", lineHeight: 1.05, color: t.text, letterSpacing: "-0.02em" }}>
                Soluções com<br /><em style={{ fontStyle: "italic" }}>qualidade e atendimento</em><br />próximo e personalizado.
              </h2>
              <p style={{ maxWidth: "380px", color: t.textSecundario, lineHeight: 1.8, fontFamily: "system-ui", fontSize: "14px", flexShrink: 0 }}>
                Cada projeto é desenvolvido para unir prazo, qualidade e satisfação — porque acreditamos que excelência deve ser acessível.
              </p>
            </div>
          </div>
        </div>

        {/* Missão — texto + foto */}
        <div ref={missaoRef} className="grid grid-cols-1 md:grid-cols-2" style={{ borderBottom: "2px solid " + t.borderForte }}>
          <div className="px-6 md:px-24 py-12 md:py-20 flex flex-col justify-center"
            style={{ borderRight: "none", opacity: missaoVisible ? 1 : 0, transform: missaoVisible ? "translateX(0)" : "translateX(-30px)", transition: "all 0.9s ease 0.1s" }}>

            <p className="uppercase mb-6" style={{ fontSize: "10px", letterSpacing: "0.25em", color: t.textSecundario, fontFamily: "system-ui" }}>
              Nossa Missão
            </p>
            <p style={{ fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)", fontWeight: "300", color: t.text, lineHeight: 1.3, marginBottom: "24px", letterSpacing: "-0.01em" }}>
              Trabalhamos com dedicação para entregar o melhor produto e uma experiência que realmente faça a diferença.
            </p>

            {/* Números */}
            <div className="flex gap-12 mt-4">
              {[
                { num: "+20", label: "Anos de mercado" },
                { num: "Todo", label: "Sudeste Brasileiro" },
              ].map(({ num, label }) => (
                <div key={label}>
                  <p style={{ fontSize: "2rem", fontWeight: "300", color: t.text, fontFamily: "Georgia, serif" }}>{num}</p>
                  <p className="uppercase mt-1" style={{ fontSize: "10px", letterSpacing: "0.15em", color: t.textSecundario, fontFamily: "system-ui" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Foto */}
          <div className="relative overflow-hidden"
            style={{ minHeight: "300px", opacity: missaoVisible ? 1 : 0, transform: missaoVisible ? "translateX(0)" : "translateX(30px)", transition: "all 0.9s ease 0.25s" }}>
            <img src="/FotoMetkzerepai.jpg"
              alt="Metzkerepai" className="w-full h-full object-cover" style={{ minHeight: "150px" }} />
            <div className="absolute bottom-8 left-8 px-6 py-4"
              style={{ backgroundColor: "rgba(26,26,26,0.9)", color: "white" }}>
              <p className="uppercase" style={{ fontSize: "9px", letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", fontFamily: "system-ui" }}>
                Localização
              </p>
              <p style={{ fontSize: "1rem", fontWeight: "300", fontFamily: "Georgia, serif", marginTop: "4px" }}>
                Polo Têxtil Santa Inês
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PORTFÓLIO ══ */}
      <section ref={galeriaRef} style={{ backgroundColor: t.bgSecundario, borderBottom: "2px solid " + t.borderForte }}>
        <div className="px-6 md:px-24 py-12 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-4"
            style={{ opacity: galeriaVisible ? 1 : 0, transform: galeriaVisible ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
            <div>
              <p className="uppercase mb-4" style={{ fontSize: "10px", letterSpacing: "0.25em", color: t.textSecundario, fontFamily: "system-ui" }}>
                Portfólio
              </p>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: "300", color: t.text, letterSpacing: "-0.02em" }}>
                Nossos<br /><em style={{ fontStyle: "italic" }}>Trabalhos</em>
              </h2>
            </div>
            <Link to="/catalogo"
              className="text-sm uppercase tracking-widest transition hover:opacity-50"
              style={{ color: t.text, fontFamily: "system-ui", letterSpacing: "0.2em", borderBottom: "1px solid " + t.text, paddingBottom: "4px" }}>
              Ver portfólio completo →
            </Link>
          </div>

          {/* Grade de fotos — máx 3, navegação só se admin adicionar mais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0" style={{ border: "2px solid " + t.borderForte }}>
            {galeria.slice(galeriaIndex * FOTOS_POR_SLIDE, galeriaIndex * FOTOS_POR_SLIDE + FOTOS_POR_SLIDE).map((url, i) => (
              <div key={i} className="overflow-hidden relative group"
                style={{ height: "350px", borderRight: i < 2 ? "2px solid " + t.borderForte : "none",
                  opacity: galeriaVisible ? 1 : 0, transform: galeriaVisible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.7s ease ${i * 0.1}s` }}>
                <img src={url} alt={`Trabalho ${i + 1}`}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
            ))}
          </div>

          {/* Navegação só aparece se tiver mais de 3 fotos */}
          {totalSlides > 1 && (
            <div className="flex items-center gap-6 mt-8">
              <button onClick={() => setGaleriaIndex(i => i > 0 ? i - 1 : totalSlides - 1)}
                className="w-10 h-10 flex items-center justify-center font-light text-2xl transition hover:opacity-50"
                style={{ border: "1px solid " + t.borderForte, color: t.text }}>‹</button>
              <div className="flex gap-2">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <button key={i} onClick={() => setGaleriaIndex(i)} style={{
                    width: i === galeriaIndex ? "24px" : "8px", height: "2px", border: "none", cursor: "pointer",
                    backgroundColor: i === galeriaIndex ? t.text : t.border, transition: "all 0.3s",
                  }} />
                ))}
              </div>
              <button onClick={() => setGaleriaIndex(i => i < totalSlides - 1 ? i + 1 : 0)}
                className="w-10 h-10 flex items-center justify-center font-light text-2xl transition hover:opacity-50"
                style={{ border: "1px solid " + t.borderForte, color: t.text }}>›</button>
            </div>
          )}
        </div>
      </section>

      {/* ══ CTA PERSONALIZADO ══ */}
      <section style={{ backgroundColor: t.text }}>
        <div className="px-6 md:px-24 py-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <p className="uppercase mb-4" style={{ fontSize: "10px", letterSpacing: "0.25em", color: "rgba(255,255,255,0.4)", fontFamily: "system-ui" }}>
              Comunicação Visual
            </p>
            <h2 style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)", fontWeight: "300", color: "white", lineHeight: 1.2 }}>
              Tenha as soluções que sua empresa<br /><em style={{ fontStyle: "italic" }}>e seus eventos precisam.</em>
            </h2>
            <p className="mt-3" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "system-ui", fontSize: "14px", maxWidth: "480px", lineHeight: 1.7 }}>
              Impressões digitais e personalização de logos para fachadas e ambientes internos.
            </p>
          </div>
          <Link to="/personalizado"
            className="px-10 py-4 text-sm uppercase tracking-widest font-medium transition hover:opacity-80 shrink-0"
            style={{ backgroundColor: "white", color: "#1a1a1a", letterSpacing: "0.15em", fontFamily: "system-ui" }}>
            Quero orçar minha ideia →
          </Link>
        </div>
      </section>

      {/* ══ RODAPÉ ══ */}
      <footer style={{ backgroundColor: t.bgSecundario, borderTop: "2px solid " + t.borderForte }}>
        <div className="px-6 md:px-24 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div style={{ borderRight: "none", paddingRight: "0" }} className="md:border-r md:pr-10" style2={{ borderColor: t.border }}>
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
        <div style={{ borderTop: "1px solid " + t.borderForte, padding: "20px 24px" }}>
          <p className="text-xs" style={{ color: t.textSecundario, fontFamily: "system-ui", letterSpacing: "0.1em" }}>
            &copy; {new Date().getFullYear()} Metzker Soluções
          </p>
        </div>
      </footer>

      <a href="https://wa.me/5527997878391" target="_blank" rel="noreferrer"
        className="fixed bottom-6 right-6 text-white px-5 py-3 rounded-full shadow-xl font-medium z-40 hover:opacity-90 transition"
        style={{ backgroundColor: "#22c55e", fontFamily: "system-ui, sans-serif" }}>
        WhatsApp
      </a>

      <style>{`
        @keyframes scrollLine {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(20px); opacity: 0; }
        }
      `}</style>
    </div>
  );
}