'use client'

import { useState } from 'react'
import { login } from './actions'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Settings, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    const result = await login(formData)
    
    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result.success) {
      router.push(`/${result.role!.toLowerCase()}`)
    }
  }

  return (
    <div className="min-h-screen flex w-full">
      {/* Cột trái: Thông tin */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 flex-col p-16 xl:p-24 justify-center relative">
        <div className="absolute top-12 left-12 xl:top-16 xl:left-16">
          <div className="bg-white rounded-2xl p-4 w-32 h-32 flex items-center justify-center shadow-lg">
            <img src="/pea-logo.png" alt="Pea Education Logo" className="max-w-full max-h-full object-contain" />
          </div>
        </div>

        <div className="mt-20 max-w-lg">
          <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-2">
            Nâng Tầm Kỹ Năng
          </h1>
          <h1 className="text-4xl xl:text-5xl font-bold text-red-500 leading-tight mb-6">
            Kiến Tạo Tương Lai
          </h1>
          <p className="text-slate-400 text-lg mb-12 leading-relaxed">
            Hệ thống quản trị nội bộ dành riêng cho đội ngũ giảng viên và nhân sự tại Pea Education.
          </p>

          <div className="space-y-8">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 shrink-0">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Vận hành đồng bộ</h3>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  Kiểm soát toàn bộ tiến trình học vụ, điểm danh và đánh giá học viên tập trung trên một nền tảng.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Bảo mật tuyệt đối</h3>
                <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                  Hệ thống phân quyền phân cấp chặt chẽ, đảm bảo dữ liệu và dòng tiền quản lý an toàn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Form đăng nhập */}
      <div className="w-full lg:w-1/2 flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Đăng nhập</h2>
                <p className="text-slate-500 text-sm">
                  Vui lòng sử dụng tài khoản nội bộ được cấp để truy cập EduCRM.
                </p>
              </div>

              <form action={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-600 font-medium text-sm">Địa chỉ Email</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    required 
                    placeholder="admin" 
                    className="h-12 bg-[#f4f6f8] border-transparent hover:bg-[#eef1f4] focus-visible:bg-white focus-visible:ring-blue-500 rounded-xl text-slate-800 transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-600 font-medium text-sm">Mật khẩu</Label>
                  <Input 
                    id="password" 
                    name="password" 
                    type="password" 
                    required 
                    placeholder="••••••••" 
                    className="h-12 bg-[#f4f6f8] border-transparent hover:bg-[#eef1f4] focus-visible:bg-white focus-visible:ring-blue-500 rounded-xl text-slate-800 transition-colors" 
                  />
                </div>
                
                {error && <div className="text-sm font-medium text-red-500 bg-red-50 p-3 rounded-xl">{error}</div>}
                
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base font-medium bg-[#0f172a] hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-900/20 mt-4 transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xác thực...' : 'Đăng nhập hệ thống'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-8 text-center">
          <p className="text-sm text-slate-400">
            © 2024 Pea Education. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
