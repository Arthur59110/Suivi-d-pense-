import LoginForm from './LoginForm'

export const dynamic = 'force-dynamic'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          Suivi Dépenses
        </h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Connectez-vous pour accéder à vos dépenses.
        </p>
        <LoginForm />
      </div>
    </div>
  )
}
