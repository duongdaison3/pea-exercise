'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"

const Star = ({ color, className }: { color: string, className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill={color}>
    <path d="M0,50 Q50,50 50,0 Q50,50 100,50 Q50,50 50,100 Q50,50 0,50 Z" />
  </svg>
)

export default function WelcomePage() {
  return (
    <div className="relative w-full min-h-screen bg-[#fffdfb] overflow-hidden flex flex-col selection:bg-[#ff5a5f] selection:text-white">
      
      {/* Header */}
      <header className="absolute top-0 left-0 w-full px-8 py-10 z-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Logo container to give it some padding if needed */}
          <img src="/pea-logo.png" alt="Pea Education" className="h-12 object-contain mix-blend-multiply" />
        </div>
      </header>

      {/* Geometric Art - Background Elements */}
      <div className="absolute inset-0 pointer-events-none z-0">
        
        {/* Diagonal Stripes Bottom Left */}
        <div className="absolute -left-32 -bottom-24 w-[120%] md:w-[80%] h-64 -rotate-[20deg] flex flex-col z-0 opacity-90">
          <div className="h-12 bg-[#ff5a5f]"></div>
          <div className="h-12 bg-[#ffb84d]"></div>
          <div className="h-12 bg-[#0d3b44]"></div>
          <div className="h-12 bg-[#ffd1dc]"></div>
        </div>

        {/* Large Dark Blue shape left */}
        <div className="absolute -left-10 bottom-32 w-64 md:w-80 h-80 md:h-[450px] bg-[#0d3b44] rounded-tr-full rounded-br-full z-10"></div>
        
        {/* Red Arch on top of dark blue */}
        <div className="absolute left-20 bottom-[400px] md:bottom-[500px] w-48 md:w-64 h-24 md:h-32 bg-[#ff5a5f] rounded-t-full z-0"></div>
        
        {/* Large Dark Blue Circle with Pink hole */}
        <div className="absolute left-40 md:left-64 -bottom-10 md:bottom-10 w-64 md:w-96 h-64 md:h-96 bg-[#0d3b44] rounded-full flex items-center justify-center z-10">
          <div className="w-24 md:w-32 h-24 md:h-32 bg-[#ffd1dc] rounded-full"></div>
        </div>

        {/* Big Yellow Star */}
        <Star color="#ffb84d" className="absolute -left-4 md:left-10 bottom-64 md:bottom-[450px] w-32 md:w-48 h-32 md:h-48 z-20" />

        {/* Small Yellow Star & Red Cap */}
        <div className="absolute left-[300px] md:left-[450px] top-[30%] md:top-[40%] flex flex-col items-center">
          <div className="w-16 md:w-20 h-8 md:h-10 bg-[#ff5a5f] rounded-t-full mb-2"></div>
          <Star color="#ffb84d" className="w-20 md:w-24 h-20 md:h-24" />
        </div>

        {/* Bottom Right Elements */}
        <div className="hidden lg:block absolute right-[10%] bottom-20">
          <div className="relative flex items-end gap-6">
            <Star color="#0d3b44" className="w-20 h-20 mb-10" />
            
            {/* Triangle */}
            <svg viewBox="0 0 100 100" className="w-32 h-32" fill="#ffb84d">
              <polygon points="0,100 100,100 0,0" />
            </svg>
            
            {/* Rainbow arches */}
            <div className="w-48 h-24 bg-[#ff5a5f] rounded-t-full flex items-end justify-center overflow-hidden relative">
              <div className="w-32 h-16 bg-[#fffdfb] rounded-t-full flex items-end justify-center">
                <div className="w-16 h-8 bg-[#0d3b44] rounded-t-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top left pink/dark blue accents */}
        <div className="absolute top-0 left-0">
          <div className="w-32 h-32 bg-[#ffd1dc] -translate-x-16 -translate-y-16 rotate-45"></div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative flex-1 flex items-center justify-end px-8 md:px-16 lg:px-32 z-10 w-full h-full pb-20 pt-32">
        <div className="flex flex-col items-end text-right max-w-2xl bg-[#fffdfb]/60 backdrop-blur-sm p-8 rounded-3xl md:bg-transparent md:backdrop-blur-none md:p-0">
          <h1 className="text-6xl md:text-7xl lg:text-[7rem] font-black text-[#0d3b44] tracking-tight leading-[0.9] mb-4">
            WELCOME
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#ff5a5f] tracking-[0.2em] uppercase mb-8 ml-2">
            TO EDUCRM SYSTEM
          </h2>
          <p className="text-slate-600 md:text-slate-500 text-base md:text-lg lg:text-xl mb-10 max-w-md leading-relaxed">
            Nền tảng quản trị nội bộ tối ưu hóa vận hành, quản lý học vụ và kết quả học tập dành riêng cho đội ngũ nhân sự tại Pea Education.
          </p>
          <Button render={<Link href="/login" />} className="bg-[#ff5a5f] hover:bg-[#e64c51] text-white px-12 py-7 rounded-[2rem] font-bold text-lg md:text-xl transition-all hover:scale-105 shadow-[0_8px_30px_rgb(255,90,95,0.3)]">
            Đăng nhập hệ thống
          </Button>
        </div>
      </main>

    </div>
  )
}
