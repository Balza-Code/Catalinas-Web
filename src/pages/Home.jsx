import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = encodeURIComponent('Feedback App de Pedidos');
    const body = encodeURIComponent(feedback || 'Quiero dejar un comentario sobre la plataforma.');
    window.location.href = `mailto:contacto@catalinas.com?subject=${subject}&body=${body}`;
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-bg to-brand-50/30 text-slate-900 font-sans">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        
        {/* --- HERO SECTION --- */}
        <header className="relative overflow-hidden rounded-[2.5rem] bg-surface-card border border-surface-border shadow-xl shadow-brand-500/5 p-8 sm:p-12 lg:p-16">
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative max-w-3xl z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-4 py-2 text-sm font-bold tracking-wide text-brand-700 shadow-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
              Para dueños de bodegas y negocios
            </div>
            
            <h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1]">
              Abastece tu negocio con las <span className="text-brand-600">mejores Catalinas</span>
            </h1>
            
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600 font-medium sm:text-xl">
              Haz tus pedidos directo al horno de Ildefonso, sin esperas, llamadas largas, ni complicaciones. Todo desde tu celular.
            </p>
            
            <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="inline-flex items-center justify-center rounded-button bg-brand-500 px-8 py-4 text-xl font-black text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-brand-200 active:translate-y-0"
              >
                Ingresar a mi Cuenta
              </button>
              <p className="max-w-xs text-sm leading-relaxed text-slate-500 font-medium">
                Acceso rápido y seguro a tu plataforma de pedidos y catálogo de precios.
              </p>
            </div>
          </div>
        </header>

        {/* --- PASOS --- */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Comprar nunca fue tan fácil</h2>
          <p className="mt-3 text-slate-500 font-medium">Tres simples pasos para tener tus vitrinas llenas.</p>
        </div>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] border border-surface-border bg-surface-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-brand-200 hover:-translate-y-1">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 border border-brand-100 text-2xl font-black text-brand-600 shadow-sm">
              1
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Elige</h3>
            <p className="mt-3 text-base leading-relaxed text-slate-600 font-medium">
              Abre el catálogo, selecciona cuántos paquetes necesitas y elige la tanda que mejor se adapte a ti.
            </p>
          </div>

          <div className="rounded-[2rem] border border-surface-border bg-surface-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-brand-200 hover:-translate-y-1">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 border border-brand-100 text-2xl font-black text-brand-600 shadow-sm">
              2
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Confirma</h3>
            <p className="mt-3 text-base leading-relaxed text-slate-600 font-medium">
              Revisa tu pedido, conoce el costo exacto al instante y envíalo con un solo toque desde el celular.
            </p>
          </div>

          <div className="rounded-[2rem] border border-surface-border bg-surface-card p-8 shadow-sm transition-all hover:shadow-xl hover:border-brand-200 hover:-translate-y-1">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 border border-brand-100 text-2xl font-black text-brand-600 shadow-sm">
              3
            </div>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Recibe</h3>
            <p className="mt-3 text-base leading-relaxed text-slate-600 font-medium">
              Te avisaremos en tiempo real cuando tu tanda esté calientita y lista para recoger o enviar.
            </p>
          </div>
        </section>

        {/* --- FEEDBACK --- */}
        <section className="mt-16 rounded-[2.5rem] border border-surface-border bg-surface-card p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <div className="inline-block rounded-full bg-slate-100 px-3 py-1 mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                Mejora Continua
              </div>
              <h2 className="text-3xl font-black tracking-tight text-slate-800 sm:text-4xl">
                Queremos escucharte
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-600 font-medium">
                ¿Qué te gustaría ver en la aplicación? Ayúdanos a construir la herramienta perfecta para tu negocio.
              </p>
            </div>
            
            <div className="w-full lg:max-w-md rounded-[2rem] bg-surface-bg border border-surface-border p-6 sm:p-8 shadow-inner">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="feedback" className="block text-sm font-bold text-slate-700 mb-2">
                    Tu comentario o idea
                  </label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows="4"
                    className="w-full rounded-button border border-surface-border bg-surface-card px-4 py-3 text-sm text-slate-800 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors resize-none"
                    placeholder="Escribe aquí qué cosas harían tu trabajo más fácil..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-button bg-slate-800 px-6 py-4 text-base font-bold text-white shadow-md transition-colors hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                >
                  Enviar mi idea
                </button>
                {sent && (
                  <div className="rounded-button bg-brand-50 border border-brand-200 p-3 text-center">
                    <p className="text-sm font-bold text-brand-700">¡Gracias! Hemos preparado tu app de correo.</p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>
        
        {/* Footer simple */}
        <footer className="mt-20 text-center pb-8">
          <p className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} Catalinas de Ildefonso. Creado para los negocios locales.
          </p>
        </footer>

      </div>
    </div>
  );
}
