import { useState, useEffect, useRef } from "react";
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

// Hook para animação de entrada ao fazer scroll
function useScrollReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
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

  const [sobreRef, sobreVisible] = useScrollReveal();
  const [historiaRef, historiaVisible] = useScrollReveal();
  const [timelineRef, timelineVisible] = useScrollReveal();
  const [galeriaRef, galeriaVisible] = useScrollReveal();

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

  const timeline = [
    { ano: "2015", titulo: "O Início", texto: "A Metzker nasceu do sonho de oferecer confecções de qualidade para Vila Velha e região, com atendimento próximo e personalizado." },
    { ano: "2018", titulo: "Crescimento", texto: "Expandimos nosso catálogo com novas peças e passamos a atender clientes de todo o Espírito Santo." },
    { ano: "2021", titulo: "Comunicação Visual", texto: "Ampliamos para serviços de comunicação visual, atendendo empresas com banners, logos e impressões personalizadas." },
    { ano: "2024", titulo: "Presença Digital", texto: "Lançamos nossa loja online para atender clientes em todo o Brasil com a mesma qualidade de sempre." },
  ];

  return (
    <div style={{ backgroundColor: t.bg, color: t.text }}>

      {/* ── HERO ── */}
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

      {/* ── SOBRE NÓS ── */}
      <section ref={sobreRef} className="py-24 px-10" style={{ backgroundColor: t.bgSecundario }}>
        <div className="max-w-6xl mx-auto">
          {/* Título centralizado grande */}
          <div className="text-center mb-20"
            style={{ opacity: sobreVisible ? 1 : 0, transform: sobreVisible ? "translateY(0)" : "translateY(40px)", transition: "all 0.8s ease" }}>
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: t.textSecundario }}>Quem Somos</p>
            <h2 className="font-bold" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)", letterSpacing: "-0.02em", color: t.text, lineHeight: 1 }}>
              NOSSA HISTÓRIA
            </h2>
            <div style={{ width: "60px", height: "2px", backgroundColor: t.borderForte, margin: "24px auto 0" }} />
          </div>

          {/* Duas colunas — texto + imagem */}
          <div ref={historiaRef} className="grid md:grid-cols-2 gap-16 items-center mb-24"
            style={{ opacity: historiaVisible ? 1 : 0, transform: historiaVisible ? "translateX(0)" : "translateX(-40px)", transition: "all 0.9s ease 0.2s" }}>
            <div>
              <p className="text-xs uppercase tracking-widest mb-6" style={{ color: t.textSecundario }}>Nossa Missão</p>
              <h3 className="text-3xl font-bold mb-6 leading-tight" style={{ color: t.text }}>
                Vestir com qualidade,<br />atender com carinho.
              </h3>
              <p className="text-lg leading-relaxed mb-6" style={{ color: t.textSecundario }}>
                Somos uma empresa familiar localizada em Vila Velha, especializada em confecções de alta qualidade.
                Trabalhamos com dedicação, atenção aos detalhes e compromisso com a satisfação dos nossos clientes.
              </p>
              <p className="text-lg leading-relaxed" style={{ color: t.textSecundario }}>
                Cada peça é pensada para combinar conforto, estilo e durabilidade — porque acreditamos que moda
                de qualidade deve estar ao alcance de todos.
              </p>
              <div className="flex gap-10 mt-10">
                {[{ num: "9+", label: "Anos de experiência" }, { num: "500+", label: "Clientes satisfeitos" }, { num: "1000+", label: "Peças produzidas" }].map(({ num, label }) => (
                  <div key={label}>
                    <p className="text-3xl font-bold" style={{ color: t.text }}>{num}</p>
                    <p className="text-xs uppercase tracking-wider mt-1" style={{ color: t.textSecundario }}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div style={{ height: "480px", backgroundColor: t.border, overflow: "hidden", border: "2px solid " + t.borderForte }}>
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=800"
                  alt="Metzker Confecções" className="w-full h-full object-cover" />
              </div>
              {/* Caixa decorativa sobreposta */}
              <div className="absolute -bottom-6 -left-6 w-32 h-32 flex items-center justify-center"
                style={{ backgroundColor: t.text, color: "#FAF8F5" }}>
                <div className="text-center">
                  <p className="text-2xl font-bold">Vila</p>
                  <p className="text-2xl font-bold">Velha</p>
                  <p className="text-xs tracking-widest mt-1" style={{ color: t.border }}>ES</p>
                </div>
              </div>
            </div>
          </div>

          {/* LINHA DO TEMPO */}
          <div ref={timelineRef}>
            <p className="text-xs uppercase tracking-widest mb-12 text-center" style={{ color: t.textSecundario }}>Nossa trajetória</p>
            <div className="relative">
              {/* Linha central */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px"
                style={{ backgroundColor: t.borderForte, transform: "translateX(-50%)" }} />

              <div className="space-y-12">
                {timeline.map((item, i) => (
                  <div key={item.ano}
                    style={{
                      opacity: timelineVisible ? 1 : 0,
                      transform: timelineVisible ? "translateY(0)" : "translateY(30px)",
                      transition: `all 0.7s ease ${i * 0.15}s`
                    }}
                    className={`flex items-start gap-8 md:gap-0 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>

                    {/* Conteúdo */}
                    <div className={`flex-1 ${i % 2 === 0 ? "md:pr-16 md:text-right" : "md:pl-16"}`}>
                      <div className="inline-block px-6 py-5"
                        style={{ backgroundColor: t.bgCard, border: "1px solid " + t.border, maxWidth: "420px" }}>
                        <p className="text-2xl font-bold mb-1" style={{ color: t.text }}>{item.ano}</p>
                        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: t.textSecundario }}>{item.titulo}</p>
                        <p className="text-sm leading-relaxed" style={{ color: t.textSecundario }}>{item.texto}</p>
                      </div>
                    </div>

                    {/* Ponto central */}
                    <div className="hidden md:flex items-center justify-center w-4 h-4 rounded-full shrink-0 mt-5"
                      style={{ backgroundColor: t.text, border: "3px solid " + t.bgSecundario, zIndex: 1 }} />

                    {/* Espaço do outro lado */}
                    <div className="flex-1 hidden md:block" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Divisor />

      {/* ── PORTFÓLIO ── */}
      <section ref={galeriaRef} className="py-24 px-10" style={{ backgroundColor: t.bg }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16"
            style={{ opacity: galeriaVisible ? 1 : 0, transform: galeriaVisible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease" }}>
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: t.textSecundario }}>Portfólio</p>
            <h2 className="text-4xl font-bold" style={{ color: t.text }}>Nossos Trabalhos</h2>
          </div>

          <div className="grid grid-cols-3" style={{ gap: "20px" }}>
            {galeria.slice(galeriaIndex * FOTOS_POR_SLIDE, galeriaIndex * FOTOS_POR_SLIDE + FOTOS_POR_SLIDE).map((url, i) => (
              <div key={i} className="overflow-hidden"
                style={{ border: "2px solid " + t.borderForte, height: "300px",
                  opacity: galeriaVisible ? 1 : 0,
                  transform: galeriaVisible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.6s ease ${i * 0.1}s` }}>
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