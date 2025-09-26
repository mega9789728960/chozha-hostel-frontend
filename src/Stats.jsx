import React from 'react'

function Stats({isLight}) {
  return (
    // Professional Stats Section
    <section className={isLight?"light-mode":""}>
    <div className={"py-12 sm:py-16 md:py-20 px-4 relative z-10"}>
      <div className={"max-w-5xl mx-auto"}>
        <div className={"glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 professional-shadow"}>
          <div className={"text-center mb-8 sm:mb-12"}>
            <h2 className={"text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-2"}>
              Trusted by Students & Administrators
            </h2>
            <p className={"text-slate-400 text-base sm:text-lg px-4"}>
              Delivering excellence in hostel management services
            </p>
          </div>

          <div className={"grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center"}>
            <div className={"stats-card rounded-xl sm:rounded-2xl p-4 sm:p-6"}>
              <div className={"text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-2 sm:mb-3"}>
                500+
              </div>
              <div className={"text-slate-400 font-medium text-xs sm:text-sm md:text-base"}>
                Active Students
              </div>
            </div>

            <div className={"stats-card rounded-xl sm:rounded-2xl p-4 sm:p-6"}>
              <div className={"text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-2 sm:mb-3"}>
                99.5%
              </div>
              <div className={"text-slate-400 font-medium text-xs sm:text-sm md:text-base"}>
                System Uptime
              </div>
            </div>

            <div className={"stats-card rounded-xl sm:rounded-2xl p-4 sm:p-6"}>
              <div className={"text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-2 sm:mb-3"}>
                24/7
              </div>
              <div className={"text-slate-400 font-medium text-xs sm:text-sm md:text-base"}>
                Support Available
              </div>
            </div>

            <div className={"stats-card rounded-xl sm:rounded-2xl p-4 sm:p-6"}>
              <div className={"text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-2 sm:mb-3"}>
                100%
              </div>
              <div className={"text-slate-400 font-medium text-xs sm:text-sm md:text-base"}>
                Digital Process
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </section>
  )
}

export default Stats
