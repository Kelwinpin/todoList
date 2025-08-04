import { useForm } from 'react-hook-form'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Flag, X } from "lucide-react";

interface TodoFormData {
  title: string
  description: string
  day_to_do: string
  priority_id: number
}

interface Priority {
  id: number
  description: string
}

interface TodoFormProps {
  editingTask: string | null
  priorities: Priority[]
  onSubmit: (data: TodoFormData) => void
  onCancel: () => void
  initialData?: TodoFormData
}

const getPriorityIcon = (priorityDescription: string) => {
  switch (priorityDescription.toLowerCase()) {
    case 'baixa': return '🟢'
    case 'media': case 'média': return '🟡'
    case 'alta': return '🔴'
    default: return '⚪'
  }
}

export default function TodoForm({ 
  editingTask, 
  priorities,
  onSubmit,
  onCancel,
  initialData
}: TodoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm<TodoFormData>({
    defaultValues: initialData || {
      title: '',
      description: '',
      day_to_do: '',
      priority_id: priorities[0]?.id || 1
    }
  })

  const selectedPriorityId = watch('priority_id')
  const selectedPriority = priorities.find(p => p.id === selectedPriorityId)

  const handleFormSubmit = (data: TodoFormData) => {
    onSubmit(data)
  }

  return (
    <Card className="mb-8 relative z-10 backdrop-blur-sm bg-white/10 border-white/20">
      <CardHeader className="flex justify-between">
        <CardTitle className="text-center text-white">
          {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        </CardTitle>
        <Button
            type="button"
            onClick={onCancel}
            className="relative z-10 top-1 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-a"
        >
            <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-200 mb-2">
              Título da Tarefa
            </label>
            <Input
              id="title"
              placeholder="Digite o título da tarefa..."
              {...register('title', {
                required: 'Título é obrigatório',
                minLength: {
                  value: 3,
                  message: 'Título deve ter pelo menos 3 caracteres'
                }
              })}
              className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400 ${
                errors.title ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
              }`}
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-200 mb-2">
              Descrição
            </label>
            <Textarea
              id="description"
              placeholder="Digite a descrição da tarefa..."
              {...register('description', {
                required: 'Descrição é obrigatória',
                minLength: {
                  value: 5,
                  message: 'Descrição deve ter pelo menos 5 caracteres'
                }
              })}
              className={`bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400 resize-none ${
                errors.description ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
              }`}
              rows={3}
            />
            {errors.description && (
              <p className="text-red-400 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="day_to_do" className="block text-sm font-medium text-gray-200 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data para Fazer
              </label>
              <Input
                id="day_to_do"
                type="date"
                {...register('day_to_do', {
                  required: 'Data é obrigatória'
                })}
                className={`bg-white/10 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400 ${
                  errors.day_to_do ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''
                }`}
              />
              {errors.day_to_do && (
                <p className="text-red-400 text-sm mt-1">{errors.day_to_do.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                <Flag className="inline h-4 w-4 mr-1" />
                Prioridade
              </label>
              
              {/* Toggle Button Group */}
              <div className="flex gap-2">
                {priorities.map((priority) => {
                  const isSelected = selectedPriorityId === priority.id
                  
                  return (
                    <button
                      key={priority.id}
                      type="button"
                      onClick={() => setValue('priority_id', priority.id)}
                      className={`
                        flex-1 px-3 py-2 rounded-md border-2 transition-all duration-200 text-sm font-medium
                        hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent
                        ${isSelected
                          ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-lg'
                          : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center space-y-1">
                        <span className="text-lg">{getPriorityIcon(priority.description)}</span>
                        <span className="text-xs">{priority.description}</span>
                      </div>
                    </button>
                  )
                })}
              </div>
              
              {/* Priority indicator with animation */}
              {selectedPriority && (
                <div className="mt-2 text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 bg-purple-500/20 text-purple-300">
                    <span className="mr-1">
                      {getPriorityIcon(selectedPriority.description)}
                    </span>
                    Prioridade {selectedPriority.description}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-all duration-200 transform hover:scale-[1.02]"
            >
              {editingTask ? 'Salvar Alterações' : 'Adicionar Tarefa'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}