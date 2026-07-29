import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { WhatsAppIcon, ArrowUpRightIcon } from "../components/Icons";

const GALERIA_PADRAO = ["/Galeria1.jpeg", "/Galeria2.jpeg", "/Galeria3.jpeg"];

const HERO_PADRAO = [
  { src: "/ImagemPrincipal.jpg",  position: "center center" },
  { src: "/ImagemPrincipal2.jpg", position: "center center" },
  { src: "/ImagemPrincipal3.jpg", position: "center center" },
  { src: "/ImagemPrincipal4.jpg", position: "center center" },
];

const t = {
  bg: "#FFFFFF", bgCard: "#FFFFFF", bgSecundario: "#F4F2EE", bgDark: "#161513",
  text: "#161513", textSecundario: "#8A877F", textInvertido: "rgba(255,255,255,0.7)",
  border: "rgba(0,0,0,0.08)", borderForte: "rgba(0,0,0,0.15)",
  accent: "#C2660A", whatsapp: "#25D366",
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

function Eyebrow({ children, dark }) {
  return (
    <span className="block mb-4" style={{
      fontSize: "11px", letterSpacing: "0.22em", textTransform: "uppercase",
      fontFamily: "Manrope, sans-serif", fontWeight: "700", color: t.accent,
    }}>
      {children}
    </span>
  );
}

export default function Home() {
  const [heroAtual, setHeroAtual] = useState(0);
  const [galeria, setGaleria] = useState(GALERIA_PADRAO);
  const [heroImages, setHeroImages] = useState(HERO_PADRAO);
  const [galeriaIndex, setGaleriaIndex] = useState(0);
  const FOTOS_POR_SLIDE = 3;
  const totalSlides = Math.ceil(galeria.length / FOTOS_POR_SLIDE);

  const [heroRef, heroVisible] = useReveal(0.01);
  const [sobreRef, sobreVisible] = useReveal();
  const [missaoRef, missaoVisible] = useReveal();
  const [porqueRef, porqueVisible] = useReveal();
  const [galeriaRef, galeriaVisible] = useReveal();

  useEffect(() => {
    const timer = setInterval(() => setHeroAtual(c => (c + 1) % heroImages.length), 4500);
    return () => clearInterval(timer);
  }, []);

  // Carrossel automático da galeria - só roda quando há mais de um slide
  useEffect(() => {
    if (totalSlides <= 1) return;
    const timer = setInterval(() => setGaleriaIndex(i => (i + 1) % totalSlides), 6000);
    return () => clearInterval(timer);
  }, [totalSlides]);

  // Carrega galeria e hero do backend (Cloudinary)
  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/";
    fetch(apiUrl + "institucional/")
      .then(r => r.json())
      .then(data => {
        const todos = data || [];
        // Galeria
        const fotos = todos
          .filter(i => i.titulo?.startsWith("galeria_") && i.imagem)
          .sort((a, b) => a.titulo.localeCompare(b.titulo))
          .map(i => i.imagem);
        if (fotos.length > 0) setGaleria(fotos);
        // Hero images (banner principal)
        const heroAPI = todos
          .filter(i => i.titulo?.startsWith("hero_") && i.imagem)
          .sort((a, b) => a.titulo.localeCompare(b.titulo))
          .map(i => ({ src: i.imagem, position: "center center" }));
        if (heroAPI.length > 0) setHeroImages(heroAPI);
      })
      .catch(() => {}); // se falhar, mantém imagens estáticas
  }, []);

  const servicos = [
    { titulo: "Uniformes corporativos", desc: "Produção e personalização para equipes, operações e eventos" },
    { titulo: "Comunicação visual",     desc: "Fachadas, ambientação e materiais gráficos" },
    { titulo: "Projetos para eventos",  desc: "Produção rápida, padronizada e com controle de qualidade" },
  ];

  const diferenciais = [
    "Cumprimento de prazos curtos e emergenciais",
    "Padronização entre pedidos",
    "Controle de qualidade na produção",
    "Atendimento direto, sem enrolação",
  ];

  const clientes = [
    "Empresas com equipe operacional (uniformes recorrentes)",
    "Empresas que participam e fazem eventos",
    "Marcas que precisam padronizar comunicação física",
    "Empresas com demandas de curto prazo",
  ];

  return (
    <div style={{ backgroundColor: t.bg, color: t.text, fontFamily: "Manrope, sans-serif", overflowX: "hidden" }}>

      {/* ══ HERO ══ */}
      <section ref={heroRef} className="relative overflow-hidden" style={{ height: "95vh", minHeight: "550px" }}>
        {heroImages.map((img, i) => (
          <div key={i} className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: heroAtual === i ? 1 : 0, backgroundImage: `url(${img.src})`, backgroundSize: "cover",
              backgroundPosition: img.position, backgroundRepeat: "no-repeat" }} />
        ))}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,10,8,0.25) 0%, rgba(10,10,8,0.78) 100%)" }} />

        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-24"
          style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? "translateY(0)" : "translateY(30px)", transition: "all 1s ease 0.2s" }}>
          <p style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.3em", color: "rgba(255,255,255,0.55)", marginBottom: "24px", fontWeight: 700 }}>
            Metzker Soluções
          </p>
          <h1 style={{ fontFamily: "Newsreader, serif", fontSize: "clamp(2rem, 5.5vw, 3.75rem)", fontWeight: "500", color: "white", lineHeight: 1.15, maxWidth: "750px", letterSpacing: "-0.01em" }}>
            Uniformes e Comunicação Visual<br />
            <em style={{ fontStyle: "italic", fontWeight: "400" }}>para empresas que precisam de</em><br />
            padrão, escala e prazo.
          </h1>
          <p className="mt-6" style={{ color: "rgba(255,255,255,0.72)", maxWidth: "480px", lineHeight: 1.8, fontSize: "15px" }}>
            Produção em escala com consistência, rapidez e acabamento premium.
          </p>
          <div className="flex gap-3 mt-8 flex-wrap">
            <Link to="/catalogo"
              className="px-7 py-3.5 text-xs uppercase tracking-widest font-bold transition-all duration-300 hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap rounded-full"
              style={{ backgroundColor: "white", color: t.text, letterSpacing: "0.12em" }}>
              Ver Portfólio
            </Link>
            <a href="https://wa.me/5527997878391" target="_blank" rel="noreferrer"
              className="px-7 py-3.5 text-xs uppercase tracking-widest font-bold transition-all duration-300 hover:bg-white hover:text-black hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap inline-flex items-center gap-2 rounded-full"
              style={{ border: "1.5px solid rgba(255,255,255,0.7)", color: "white", letterSpacing: "0.12em" }}>
              <WhatsAppIcon size={14} strokeWidth={1.8} /> WhatsApp
            </a>
          </div>
        </div>

        <div className="absolute bottom-8 left-6 md:left-16 flex gap-3 z-10">
          {heroImages.map((_, i) => (
            <button key={i} onClick={() => setHeroAtual(i)} style={{
              width: i === heroAtual ? "32px" : "8px", height: "3px", border: "none", cursor: "pointer", borderRadius: "999px",
              backgroundColor: i === heroAtual ? "white" : "rgba(255,255,255,0.35)", transition: "all 0.4s",
            }} />
          ))}
        </div>
      </section>

      {/* ══ O QUE FAZEMOS + FOTO ══ */}
      <section ref={sobreRef} style={{ backgroundColor: t.bg }}>
        <div ref={missaoRef} className="grid grid-cols-1 md:grid-cols-2 md:gap-14 px-6 md:px-16 py-14 md:py-24">
          {/* Esquerda: todo o conteúdo textual empilhado */}
          <div style={{ opacity: sobreVisible ? 1 : 0, transform: sobreVisible ? "translateX(0)" : "translateX(-30px)", transition: "all 0.9s ease" }}>

            {/* Bloco 1: O que fazemos */}
            <div className="mb-10">
              <Eyebrow>O que fazemos</Eyebrow>
              <h2 style={{ fontFamily: "Newsreader, serif", fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)", fontWeight: "500", lineHeight: 1.2, color: t.text, letterSpacing: "-0.01em", marginBottom: "28px" }}>
                Produzimos e personalizamos<br />
                <em style={{ fontStyle: "italic", fontWeight: "400" }}>uniformes e comunicação</em><br />
                visual para empresas.
              </h2>
              <div className="flex flex-col" style={{ borderBottom: "1px solid " + t.border }}>
                {servicos.map((s, i) => (
                  <div key={i} className="py-5 flex gap-5" style={{ borderTop: "1px solid " + t.border }}>
                    <span style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontWeight: 500, fontSize: "22px", color: t.accent, minWidth: "36px", lineHeight: 1 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p style={{ fontSize: "14.5px", fontWeight: "700", color: t.text, marginBottom: "3px" }}>{s.titulo}</p>
                      <p style={{ fontSize: "13px", color: t.textSecundario, lineHeight: 1.6 }}>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bloco 2: Com quem trabalhamos */}
            <div className="p-6 md:p-7 shadow-sm" style={{ backgroundColor: "#FAFAF9", border: "1px solid " + t.border, borderRadius: "20px" }}>
              <Eyebrow>Com quem trabalhamos</Eyebrow>
              <p style={{ fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)", fontWeight: "500", color: t.text, lineHeight: 1.7, marginBottom: "20px" }}>
                Atendemos empresas que precisam de fornecedor confiável, não de tentativa e erro. Somos a melhor opção para:
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {clientes.map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <span style={{ color: t.accent, fontWeight: "700", flexShrink: 0, fontSize: "14px" }}>→</span>
                    <p style={{ fontSize: "13.5px", color: t.textSecundario, lineHeight: 1.5 }}>{c}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Direita: foto */}
          <div className="mt-10 md:mt-0" style={{
            position: "relative", minHeight: "480px",
            opacity: missaoVisible ? 1 : 0,
            transform: missaoVisible ? "translateX(0)" : "translateX(30px)",
            transition: "all 0.9s ease 0.2s",
          }}>
            <div className="absolute inset-0 overflow-hidden shadow-xl" style={{ borderRadius: "24px" }}>
              <img src="/FotoMetkzerepai.jpg" alt="Metzker"
                className="w-full h-full object-cover" style={{ objectPosition: "center 35%" }} />
            </div>
            <div className="shadow-lg" style={{ position: "absolute", bottom: "24px", left: "24px", padding: "16px 22px", backgroundColor: t.bgDark, color: "white", borderRadius: "16px" }}>
              <p style={{ fontSize: "9px", letterSpacing: "0.22em", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", fontWeight: 700 }}>Localização</p>
              <p style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontSize: "1rem", fontWeight: "500", marginTop: "5px" }}>Polo Têxtil Santa Inês</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PORQUE NOS ESCOLHEM ══ */}
      <section ref={porqueRef} style={{ backgroundColor: t.bgDark }}>
        <div className="px-6 md:px-24 py-16 md:py-24">
          <div style={{ opacity: porqueVisible ? 1 : 0, transform: porqueVisible ? "translateY(0)" : "translateY(30px)", transition: "all 0.8s ease" }}>
            <Eyebrow dark>Porque nossos clientes escolhem a Metzker</Eyebrow>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 mt-6">
              {/* Esquerda - texto institucional */}
              <div>
                <p style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontSize: "clamp(1.3rem, 2.4vw, 1.85rem)", fontWeight: "500", color: "white", lineHeight: 1.5 }}>
                  Estamos há mais de <span style={{ color: t.accent }}>20 anos</span> atendendo empresas em todo Sudeste, focados em entrega consistente e relacionamento de longo prazo.
                </p>
                <p className="mt-5" style={{ fontSize: "14px", color: "rgba(255,255,255,0.65)", lineHeight: 1.8 }}>
                  Atendemos desde demandas pontuais até operações recorrentes.
                </p>
              </div>
              {/* Direita - diferenciais */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {diferenciais.map((d, i) => (
                  <p key={i} className="pl-4" style={{ borderLeft: "2px solid " + t.accent, fontSize: "13.5px", color: "rgba(255,255,255,0.9)", lineHeight: 1.6 }}>{d}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PROJETOS ENTREGUES ══ */}
      <section ref={galeriaRef} style={{ backgroundColor: t.bg }}>
        <div className="px-6 md:px-24 py-16 md:py-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 md:mb-16 gap-4"
            style={{ opacity: galeriaVisible ? 1 : 0, transform: galeriaVisible ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}>
            <div>
              <Eyebrow>Projetos entregues</Eyebrow>
              <h2 style={{ fontFamily: "Newsreader, serif", fontSize: "clamp(1.8rem, 3.6vw, 2.9rem)", fontWeight: "500", color: t.text, letterSpacing: "-0.01em" }}>
                Alguns dos trabalhos<em style={{ fontStyle: "italic", fontWeight: 400 }}> que já entregamos</em>
              </h2>
              <p className="mt-3" style={{ fontSize: "14px", color: t.textSecundario, maxWidth: "380px", lineHeight: 1.6 }}>
                Para empresas e eventos que precisavam de padrão e prazo.
              </p>
            </div>
            <Link to="/catalogo"
              className="text-sm uppercase tracking-widest transition-all duration-300 hover:gap-3 whitespace-nowrap inline-flex items-center gap-2"
              style={{ color: t.text, letterSpacing: "0.15em", fontWeight: "700" }}>
              Ver portfólio completo <ArrowUpRightIcon size={14} strokeWidth={2.2} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-rows-2 gap-4">
            {galeria.slice(galeriaIndex * FOTOS_POR_SLIDE, galeriaIndex * FOTOS_POR_SLIDE + FOTOS_POR_SLIDE).map((url, i) => (
              <div key={i} className={`overflow-hidden relative group shadow-md hover:shadow-xl h-[260px] sm:h-auto ${i === 0 ? "sm:row-span-2" : ""}`}
                style={{
                  borderRadius: "20px",
                  opacity: galeriaVisible ? 1 : 0, transform: galeriaVisible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.7s ease ${i * 0.1}s`,
                }}>
                <img src={url} alt={`Projeto ${i + 1}`}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-105" />
              </div>
            ))}
          </div>

          {totalSlides > 1 && (
            <div className="flex items-center gap-6 mt-8">
              <button onClick={() => setGaleriaIndex(i => i > 0 ? i - 1 : totalSlides - 1)}
                className="w-10 h-10 flex items-center justify-center font-light text-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 rounded-full"
                style={{ border: "1px solid " + t.borderForte, color: t.text }}>‹</button>
              <div className="flex gap-2">
                {Array.from({ length: totalSlides }).map((_, i) => (
                  <button key={i} onClick={() => setGaleriaIndex(i)} style={{
                    width: i === galeriaIndex ? "24px" : "8px", height: "3px", border: "none", cursor: "pointer", borderRadius: "999px",
                    backgroundColor: i === galeriaIndex ? t.text : t.border, transition: "all 0.3s",
                  }} />
                ))}
              </div>
              <button onClick={() => setGaleriaIndex(i => i < totalSlides - 1 ? i + 1 : 0)}
                className="w-10 h-10 flex items-center justify-center font-light text-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 rounded-full"
                style={{ border: "1px solid " + t.borderForte, color: t.text }}>›</button>
            </div>
          )}
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section style={{ background: "linear-gradient(135deg, #161513 0%, #3a352c 100%)" }}>
        <div className="px-6 md:px-24 py-16 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <Eyebrow dark>Comunicação Visual & Uniformes</Eyebrow>
            <h2 style={{ fontFamily: "Newsreader, serif", fontStyle: "italic", fontSize: "clamp(1.7rem, 3.6vw, 2.6rem)", fontWeight: "500", color: "white", lineHeight: 1.2 }}>
              Quer fazer um orçamento?
            </h2>
            <p className="mt-3" style={{ color: "rgba(255,255,255,0.7)", fontSize: "14px", maxWidth: "380px", lineHeight: 1.7 }}>
              Fale direto com a equipe e veja como podemos atender seu projeto.
            </p>
          </div>
          <Link to="/personalizado"
            className="px-10 py-4 text-sm uppercase tracking-widest font-bold transition-all duration-300 hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5 shrink-0 whitespace-nowrap rounded-full"
            style={{ backgroundColor: "white", color: t.text, letterSpacing: "0.15em" }}>
            Faça uma cotação →
          </Link>
        </div>
      </section>

      {/* Botão flutuante WhatsApp */}
      <a href="https://wa.me/5527997878391" target="_blank" rel="noreferrer"
        aria-label="Fale pelo WhatsApp"
        className="fixed bottom-6 right-6 flex items-center justify-center text-white shadow-xl z-40 hover:opacity-90 hover:scale-105 transition"
        style={{ backgroundColor: t.whatsapp, width: "56px", height: "56px", borderRadius: "50%" }}>
        <span className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: t.whatsapp, opacity: 0.5 }} />
        <WhatsAppIcon size={26} strokeWidth={1.7} className="relative" />
      </a>
    </div>
  );
}
