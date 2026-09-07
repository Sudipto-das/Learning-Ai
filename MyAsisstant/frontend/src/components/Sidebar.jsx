import { ShieldCheck, X } from 'lucide-react'

const skills = ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker']

export default function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-[280px] sm:w-[300px] lg:w-[320px]
          h-full bg-navy-900 border-r border-navy-700/60
          flex flex-col p-5 sm:p-6 lg:p-8
          overflow-hidden
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-navy-800 border border-navy-700/50 flex items-center justify-center text-navy-400 hover:text-white hover:border-navy-600 transition-colors lg:hidden"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="mb-2">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[2px] text-gold-500 uppercase">
            Candidate Dossier
          </span>
        </div>

        {/* Avatar */}
        <div className="mt-5 sm:mt-6 mb-4 sm:mb-5">
          <div className="w-[64px] sm:w-[72px] h-[64px] sm:h-[72px] rounded-2xl bg-navy-800 border-2 border-gold-500/40 flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-bold text-gold-400">SD</span>
          </div>
        </div>

        {/* Name & Info */}
        <h1 className="text-[22px] sm:text-[26px] font-bold text-white leading-tight tracking-tight">
          Sudipto Das
        </h1>
        <p className="text-[13px] sm:text-[15px] text-navy-300 mt-1.5 font-medium">
          Full Stack Developer (MERN)
        </p>
        <p className="text-[12px] sm:text-[14px] text-navy-400 mt-0.5">
          Kolkata, India
        </p>

        {/* Divider */}
        <div className="h-px bg-navy-700/60 my-6" />

        {/* Core Stack */}
        <div>
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[2px] text-navy-400 uppercase">
            Core Stack
          </span>
          <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-3 sm:px-3.5 py-1.5 rounded-lg bg-navy-800 border border-navy-600/50 text-[12px] sm:text-[13px] font-medium text-navy-200 hover:border-gold-500/30 hover:text-gold-300 transition-all duration-200 cursor-default"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Grounded Card */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-navy-800/70 border border-navy-600/40">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              <ShieldCheck className="w-5 h-5 text-gold-500" strokeWidth={2} />
            </div>
            <div>
              <p className="text-[13px] sm:text-[14px] font-semibold text-gold-400 leading-snug">
                Grounded, not generated.
              </p>
              <p className="text-[12px] sm:text-[13px] text-navy-300 mt-1.5 leading-relaxed">
                Every answer here is checked against Sudipto's actual resume data — no invented experience.
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
