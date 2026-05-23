import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center px-6 bg-white">
      <div className="w-full max-w-[380px] mx-auto">
        <h1 className="text-[32px] font-bold text-black mb-1">Suivi</h1>
        <p className="text-[16px] text-[#8A8A8A] mb-8">Paloma & Arthur</p>
        <LoginForm />
      </div>
    </div>
  )
}
