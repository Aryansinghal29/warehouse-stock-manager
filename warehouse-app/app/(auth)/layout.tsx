export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-900/10 rounded-full blur-3xl" />
      </div>

      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,179,237,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,179,237,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { top: '10%', left: '8%', size: 'text-4xl', opacity: 'opacity-10', delay: '0s' },
          { top: '20%', right: '10%', size: 'text-5xl', opacity: 'opacity-10', delay: '0.5s' },
          { top: '60%', left: '5%', size: 'text-3xl', opacity: 'opacity-10', delay: '1s' },
          { top: '75%', right: '8%', size: 'text-4xl', opacity: 'opacity-10', delay: '1.5s' },
          { top: '45%', left: '15%', size: 'text-2xl', opacity: 'opacity-[0.07]', delay: '0.3s' },
          { top: '30%', right: '20%', size: 'text-2xl', opacity: 'opacity-[0.07]', delay: '0.8s' },
        ].map((item, i) => (
          <span
            key={i}
            className={`absolute ${item.size} ${item.opacity} animate-bounce`}
            style={{ top: item.top, left: item.left, right: item.right, animationDelay: item.delay, animationDuration: '3s' }}
          >
            {['📦', '🏭', '📋', '🚛', '📊', '🔧'][i]}
          </span>
        ))}
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">W</div>
        <span className="text-white/70 font-semibold tracking-wide text-sm">Warehouse Manager</span>
      </div>

      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>
  );
}
