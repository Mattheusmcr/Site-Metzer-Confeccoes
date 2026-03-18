import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const GALERIA_KEY = "metzker_galeria_trabalhos";

const GALERIA_PADRAO = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800",
  "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800",
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800",
  "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?q=80&w=800",
  "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=800",
  "https://images.unsplash.com/photo-1582719471384-894fbb16e074?q=80&w=800",
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
  const [galeriaIndex, setGaleriaIndex] = useState(0);
  const [galeria, setGaleria] = useState(() => {
    try { const s = localStorage.getItem(GALERIA_KEY); return s ? JSON.parse(s) : GALERIA_PADRAO; }
    catch { return GALERIA_PADRAO; }
  });

  const [heroRef, heroVisible] = useReveal(0.01);
  const [sobreRef, sobreVisible] = useReveal();
  const [missaoRef, missaoVisible] = useReveal();
  const [timelineRef, timelineVisible] = useReveal();
  const [galeriaRef, galeriaVisible] = useReveal();

  useEffect(() => {
    const t = setInterval(() => setHeroAtual(c => (c + 1) % heroImages.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fn = e => { if (e.key === GALERIA_KEY && e.newValue) { try { setGaleria(JSON.parse(e.newValue)); } catch {} } };
    window.addEventListener("storage", fn);
    return () => window.removeEventListener("storage", fn);
  }, []);

  const FOTOS_POR_SLIDE = 3;
  const totalSlides = Math.ceil(galeria.length / FOTOS_POR_SLIDE);

  const timeline = [
    { ano: "2015", titulo: "O Início", texto: "A Metzker nasceu do sonho de oferecer confecções de qualidade para Vila Velha e região, com atendimento próximo e personalizado." },
    { ano: "2018", titulo: "Crescimento", texto: "Expandimos nosso catálogo com novas peças e passamos a atender clientes de todo o Espírito Santo." },
    { ano: "2021", titulo: "Comunicação Visual", texto: "Ampliamos para serviços de comunicação visual, atendendo empresas com banners, logos e impressões personalizadas." },
    { ano: "2024", titulo: "Presença Digital", texto: "Lançamos nossa loja online para atender clientes em todo o Brasil com a mesma qualidade de sempre." },
  ];

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, fontFamily: "Georgia, serif" }}>

      {/* ══ HERO ══ */}
      <section ref={heroRef} className="relative overflow-hidden"
        style={{ height: "100vh", minHeight: "600px" }}>
        {heroImages.map((img, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: heroAtual === i ? 1 : 0, backgroundImage: `url(${img})`, backgroundSize: "cover", backgroundPosition: "center" }} />
        ))}
        <div className="absolute inset-0" style={{ backgroundColor: "rgba(10,10,10,0.55)" }} />

        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-24"
          style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(30px)", transition: "all 1s ease 0.2s" }}>
          <p className="text-xs uppercase tracking-widest mb-6" style={{ color: "rgba(255,255,255,0.5)", letterSpacing: "0.3em" }}>
            Metzker Confecções
          </p>
          <h1 style={{ fontSize: "clamp(2.5rem, 6vw, 5.5rem)", fontWeight: "300", color: "white", lineHeight: 1.1, maxWidth: "700px", letterSpacing: "-0.01em" }}>
            Veste quem<br /><em style={{ fontStyle: "italic", fontWeight: "400" }}>tem estilo.</em>
          </h1>
          <p className="mt-6 text-lg" style={{ color: "rgba(255,255,255,0.65)", maxWidth: "420px", lineHeight: 1.7, fontFamily: "system-ui, sans-serif" }}>
            Moda com identidade, qualidade e estilo para quem veste atitude.
          </p>
          <div className="flex gap-4 mt-10 flex-wrap">
            <Link to="/catalogo"
              className="px-8 py-3 text-sm uppercase tracking-widest font-medium transition hover:opacity-80"
              style={{ backgroundColor: "white", color: "#1a1a1a", letterSpacing: "0.15em" }}>
              Ver Catálogo
            </Link>
            <a href="https://wa.me/5527997878391" target="_blank" rel="noreferrer"
              className="px-8 py-3 text-sm uppercase tracking-widest font-medium transition hover:bg-white hover:text-black"
              style={{ border: "1px solid rgba(255,255,255,0.6)", color: "white", letterSpacing: "0.15em" }}>
              WhatsApp
            </a>
          </div>
        </div>

        {/* Indicadores */}
        <div className="absolute bottom-8 left-16 flex gap-3 z-10">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setHeroAtual(i)} style={{
              width: i === heroAtual ? "32px" : "8px", height: "2px", border: "none", cursor: "pointer",
              backgroundColor: i === heroAtual ? "white" : "rgba(255,255,255,0.35)", transition: "all 0.4s",
            }} />
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 right-16 z-10 flex-col items-center gap-2 hidden md:flex">
          <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)", writingMode: "vertical-rl" }}>
            Scroll
          </p>
          <div style={{ width: "1px", height: "40px", backgroundColor: "rgba(255,255,255,0.2)" }}>
            <div style={{ width: "1px", height: "20px", backgroundColor: "white", animation: "scrollLine 1.5s ease-in-out infinite" }} />
          </div>
        </div>
      </section>

      {/* ══ NOSSA HISTÓRIA ══ */}
      <section ref={sobreRef} style={{ backgroundColor: t.bg }}>
        {/* Título em destaque */}
        <div className="px-6 md:px-24 py-16 border-b" style={{ borderColor: t.borderForte }}>
          <div className="flex items-end justify-between flex-wrap gap-6"
            style={{ opacity: sobreVisible ? 1 : 0, transform: sobreVisible ? "translateY(0)" : "translateY(40px)", transition: "all 0.9s ease" }}>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: t.textSecundario, letterSpacing: "0.25em", fontFamily: "system-ui" }}>
                Quem somos
              </p>
              <h2 style={{ fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: "300", lineHeight: 1.05, color: t.text, letterSpacing: "-0.02em" }}>
                Nossa<br /><em style={{ fontStyle: "italic" }}>História</em>
              </h2>
            </div>
            <p style={{ maxWidth: "420px", color: t.textSecundario, lineHeight: 1.8, fontFamily: "system-ui, sans-serif", fontSize: "15px" }}>
              Somos uma empresa familiar localizada em Vila Velha, especializada em confecções de alta qualidade.
              Trabalhamos com dedicação, atenção aos detalhes e compromisso com a satisfação dos nossos clientes.
            </p>
          </div>
        </div>

        {/* Missão — texto + foto lado a lado */}
        <div ref={missaoRef} className="grid grid-cols-1 md:grid-cols-2"
          style={{ borderBottom: "2px solid " + t.borderForte }}>

          {/* Texto esquerda */}
          <div className="px-6 md:px-24 py-12 md:py-20 flex flex-col justify-center"
            style={{
              borderRight: "2px solid " + t.borderForte,
              opacity: missaoVisible ? 1 : 0,
              transform: missaoVisible ? "translateX(0)" : "translateX(-30px)",
              transition: "all 0.9s ease 0.1s",
            }}>
            <p className="text-xs uppercase tracking-widest mb-6" style={{ color: t.textSecundario, fontFamily: "system-ui", letterSpacing: "0.25em" }}>
              Nossa Missão
            </p>
            <h3 style={{ fontSize: "clamp(1.8rem, 3vw, 2.8rem)", fontWeight: "300", color: t.text, lineHeight: 1.2, marginBottom: "24px", letterSpacing: "-0.01em" }}>
              Vestir com qualidade,<br /><em style={{ fontStyle: "italic" }}>atender com carinho.</em>
            </h3>
            <p style={{ color: t.textSecundario, lineHeight: 1.9, fontFamily: "system-ui, sans-serif", fontSize: "15px", marginBottom: "32px" }}>
              Cada peça é pensada para combinar conforto, estilo e durabilidade — porque acreditamos que moda
              de qualidade deve estar ao alcance de todos. Nossa equipe trabalha com dedicação para entregar
              o melhor produto e a melhor experiência.
            </p>

            {/* Números */}
            <div className="flex gap-12">
              {[{ num: "9+", label: "Anos de mercado" }, { num: "500+", label: "Clientes" }, { num: "1000+", label: "Peças" }].map(({ num, label }) => (
                <div key={label}>
                  <p style={{ fontSize: "2rem", fontWeight: "300", color: t.text, fontFamily: "Georgia, serif" }}>{num}</p>
                  <p className="text-xs uppercase tracking-widest mt-1" style={{ color: t.textSecundario, fontFamily: "system-ui", letterSpacing: "0.15em" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Foto direita */}
          <div className="relative overflow-hidden"
            style={{ minHeight: "500px", opacity: missaoVisible ? 1 : 0, transform: missaoVisible ? "translateX(0)" : "translateX(30px)", transition: "all 0.9s ease 0.25s" }}>
            <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=900"
              alt="Metzker" className="w-full h-full object-cover"
              style={{ minHeight: "500px" }} />
            {/* Tag decorativa sobreposta */}
            <div className="absolute bottom-8 left-8 px-6 py-4"
              style={{ backgroundColor: "rgba(26,26,26,0.9)", color: "white" }}>
              <p className="text-xs uppercase tracking-widest" style={{ letterSpacing: "0.2em", color: "rgba(255,255,255,0.5)", fontFamily: "system-ui" }}>
                Localização
              </p>
              <p style={{ fontSize: "1.1rem", fontWeight: "300", fontFamily: "Georgia, serif", marginTop: "4px" }}>
                Vila Velha, ES
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ LINHA DO TEMPO ══ */}
      <section ref={timelineRef} style={{ backgroundColor: t.bgSecundario, borderBottom: "2px solid " + t.borderForte }}>
        <div className="px-6 md:px-24 py-12 md:py-20">
          <p className="text-xs uppercase tracking-widest mb-16 text-center" style={{ color: t.textSecundario, fontFamily: "system-ui", letterSpacing: "0.25em" }}>
            Nossa trajetória
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-0">
            {timeline.map((item, i) => (
              <div key={item.ano}
                style={{
                  borderLeft: "1px solid " + t.borderForte,
                  padding: "0 32px 0 32px",
                  opacity: timelineVisible ? 1 : 0,
                  transform: timelineVisible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.7s ease ${i * 0.12}s`,
                }}>
                <p style={{ fontSize: "3rem", fontWeight: "200", color: t.text, fontFamily: "Georgia, serif", lineHeight: 1, marginBottom: "16px" }}>
                  {item.ano}
                </p>
                <p className="text-xs uppercase tracking-widest mb-3" style={{ color: t.textSecundario, fontFamily: "system-ui", letterSpacing: "0.2em" }}>
                  {item.titulo}
                </p>
                <p style={{ color: t.textSecundario, fontSize: "14px", lineHeight: 1.8, fontFamily: "system-ui, sans-serif" }}>
                  {item.texto}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PORTFÓLIO ══ */}
      <section ref={galeriaRef} style={{ backgroundColor: t.bg, borderBottom: "2px solid " + t.borderForte }}>
        <div className="px-6 md:px-24 py-12 md:py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-4"
            style={{ opacity: galeriaVisible ? 1 : 0, transform: galeriaVisible ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: t.textSecundario, fontFamily: "system-ui", letterSpacing: "0.25em" }}>
                Portfólio
              </p>
              <h2 style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: "300", color: t.text, letterSpacing: "-0.02em" }}>
                Nossos<br /><em style={{ fontStyle: "italic" }}>Trabalhos</em>
              </h2>
            </div>
            <Link to="/catalogo"
              className="text-sm uppercase tracking-widest transition hover:opacity-50"
              style={{ color: t.text, fontFamily: "system-ui", letterSpacing: "0.2em", borderBottom: "1px solid " + t.text, paddingBottom: "4px" }}>
              Ver catálogo completo →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0"
            style={{ border: "2px solid " + t.borderForte }}>
            {galeria.slice(galeriaIndex * FOTOS_POR_SLIDE, galeriaIndex * FOTOS_POR_SLIDE + FOTOS_POR_SLIDE).map((url, i) => (
              <div key={i} className="overflow-hidden relative group"
                style={{ height: "400px", borderRight: i < 2 ? "2px solid " + t.borderForte : "none",
                  opacity: galeriaVisible ? 1 : 0,
                  transform: galeriaVisible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.7s ease ${i * 0.1}s` }}>
                <img src={url} alt={`Trabalho ${i + 1}`}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 transition duration-300 opacity-0 group-hover:opacity-100"
                  style={{ backgroundColor: "rgba(0,0,0,0.2)" }} />
              </div>
            ))}
          </div>

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
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "system-ui", letterSpacing: "0.25em" }}>
              Comunicação Visual
            </p>
            <h2 style={{ fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: "300", color: "white", lineHeight: 1.2 }}>
              Crie sua identidade<br /><em style={{ fontStyle: "italic" }}>visual do zero.</em>
            </h2>
          </div>
          <Link to="/personalizado"
            className="px-10 py-4 text-sm uppercase tracking-widest font-medium transition hover:opacity-80 shrink-0"
            style={{ backgroundColor: "white", color: "#1a1a1a", letterSpacing: "0.15em", fontFamily: "system-ui" }}>
            Fazer Personalizado →
          </Link>
        </div>
      </section>

      {/* ══ RODAPÉ ══ */}
      <footer style={{ backgroundColor: t.bgSecundario, borderTop: "2px solid " + t.borderForte }}>
        <div className="px-6 md:px-24 py-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div style={{ borderRight: "1px solid " + t.border, paddingRight: "40px" }}>
            <h3 className="mb-4 uppercase" style={{ fontSize: "10px", letterSpacing: "0.25em", color: t.text, fontFamily: "system-ui" }}>
              Metzker Têxtil e Comunicações Visuais
            </h3>
            <p style={{ color: t.textSecundario, lineHeight: 1.8, fontFamily: "system-ui, sans-serif" }}>
              Peças de alta qualidade focadas em conforto, estilo e durabilidade.
            </p>
          </div>
          <div style={{ borderRight: "1px solid " + t.border, paddingRight: "40px" }}>
            <h3 className="mb-4 uppercase" style={{ fontSize: "10px", letterSpacing: "0.25em", color: t.text, fontFamily: "system-ui" }}>Contato</h3>
            <p style={{ color: t.textSecundario, fontFamily: "system-ui" }}>WhatsApp</p>
            <p style={{ color: t.text, fontFamily: "system-ui" }}>(27) 99885-3043</p>
            <p className="mt-2" style={{ color: t.textSecundario, fontFamily: "system-ui" }}>Email</p>
            <p style={{ color: t.text, fontFamily: "system-ui" }}>contato@metzker.com</p>
          </div>
          <div>
            <h3 className="mb-4 uppercase" style={{ fontSize: "10px", letterSpacing: "0.25em", color: t.text, fontFamily: "system-ui" }}>Localização</h3>
            <p style={{ color: t.text, fontFamily: "system-ui" }}>Rua Tobias Barreto, 37</p>
            <p style={{ color: t.text, fontFamily: "system-ui" }}>Vila Velha - ES</p>
          </div>
        </div>
        <div style={{ borderTop: "1px solid " + t.borderForte, padding: "20px 24px" }}>
          <p className="text-xs" style={{ color: t.textSecundario, fontFamily: "system-ui", letterSpacing: "0.1em" }}>
            &copy; {new Date().getFullYear()} Metzker Têxtil e Comunicações Visuais
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