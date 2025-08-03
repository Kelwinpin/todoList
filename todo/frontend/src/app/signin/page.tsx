'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth';

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isRegister) {
        await authService.register(formData);
      } else {
        await authService.login({
          email: formData.email,
          password: formData.password,
        });
      }
      
      router.push('/todo');
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            {isRegister ? 'Criar Conta' : 'Entrar'}
          </CardTitle>
          <CardDescription className="text-center">
            {isRegister 
              ? 'Crie sua conta para gerenciar suas tarefas'
              : 'Entre na sua conta para acessar suas tarefas'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <Input
                  name="name"
                  type="text"
                  placeholder="Nome completo"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            )}
            
            <div>
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Input
                name="password"
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading 
                ? (isRegister ? 'Criando conta...' : 'Entrando...') 
                : (isRegister ? 'Criar Conta' : 'Entrar')
              }
            </Button>
            
            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError('');
                  setFormData({ name: '', email: '', password: '' });
                }}
                disabled={isLoading}
              >
                {isRegister 
                  ? 'Já tem uma conta? Entre aqui' 
                  : 'Não tem uma conta? Cadastre-se'
                }
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}