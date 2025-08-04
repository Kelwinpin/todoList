'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from "sonner"
import { authService } from '@/services/auth'

interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<SignupFormData>({
    mode: 'onChange'
  })

  const password = watch('password')

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true)
    
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      })
      
      toast("Conta criada com sucesso", {
        icon: <ArrowRight className="h-5 w-5" />,
        duration: 3000,
        style: {
          background: "rgba(0, 211, 0, 0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
        },
      })
      
      reset()
            
    } catch (error: unknown) {
      toast("Erro ao criar conta: " + (error instanceof Error ? error.message : String(error)), {
        icon: <AlertCircle className="h-5 w-5" />,
        duration: 3000,
        position: "top-center",
        style: {
          background: "rgba(211, 0, 0, 0.8)",
          color: "white",
          border: "none",
          padding: "10px",
          borderRadius: "5px",
        },
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[40rem] w-[40rem] bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl animate-pulse" />
      </div>
      
      <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/10 border-white/20">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold text-white">
            Criar Conta
          </CardTitle>
          <CardDescription className="text-gray-300">
            Preencha os dados para criar sua conta
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-200">
                Nome
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome completo"
                  {...register('name', {
                    required: 'Nome é obrigatório',
                    minLength: {
                      value: 2,
                      message: 'Nome deve ter pelo menos 2 caracteres'
                    }
                  })}
                  className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400 ${
                    errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                  }`}
                />
              </div>
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-200">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  {...register('email', {
                    required: 'Email é obrigatório',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Email inválido'
                    }
                  })}
                  className={`pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400 ${
                    errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-200">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Senha é obrigatória',
                    minLength: {
                      value: 6,
                      message: 'Senha deve ter pelo menos 6 caracteres'
                    }
                  })}
                  className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400 ${
                    errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-200">
                Confirmar Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('confirmPassword', {
                    required: 'Confirmação de senha é obrigatória',
                    validate: (value) => 
                      value === password || 'Senhas não coincidem'
                  })}
                  className={`pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400 ${
                    errors.confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2.5 rounded-md transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Criando conta...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Criar Conta</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-300 text-sm">
              Já tem uma conta?{' '}
              <Link href="/" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">
                Faça login aqui
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}