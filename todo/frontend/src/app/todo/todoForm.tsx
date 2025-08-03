import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, Flag, X } from "lucide-react";

interface TodoFormProps {
  editingTask: string | null
  formData: any
  setFormData: any
  cancelEdit: any
  handleInputChange: any
  handleSubmit: any
}

type Priority = 'baixa' | 'media' | 'alta'

interface PriorityOption {
  value: Priority
  label: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
}

const priorityOptions: PriorityOption[] = [
  {
    value: 'baixa',
    label: 'Baixa',
    icon: '🟢',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50'
  },
  {
    value: 'media',
    label: 'Média',
    icon: '🟡',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    borderColor: 'border-yellow-500/50'
  },
  {
    value: 'alta',
    label: 'Alta',
    icon: '🔴',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/50'
  }
]

export default function TodoForm({ 
  editingTask, 
  formData, 
  setFormData, 
  cancelEdit, 
  handleInputChange, 
  handleSubmit 
}: TodoFormProps) {

  const handlePriorityChange = (priority: Priority) => {
    setFormData((prev: any) => ({
      ...prev,
      priority
    }))
  }

  return (
    <Card className="mb-8 relative z-10 backdrop-blur-sm bg-white/10 border-white/20">
      <CardHeader className="flex justify-between">
        <CardTitle className="text-center text-white">
          {editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
        </CardTitle>
        <Button
            type="button"
            onClick={cancelEdit}
            className="relative z-10 top-1 transform -translate-y-1/2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-a"
        >
            <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
              Nome da Tarefa
            </label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Digite o nome da tarefa..."
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400 focus:ring-purple-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-200 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Data de Conclusão
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                className="bg-white/10 border-white/20 text-white focus:border-purple-400 focus:ring-purple-400"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-200 mb-3">
                <Flag className="inline h-4 w-4 mr-1" />
                Prioridade
              </label>
              
              {/* Toggle Button Group */}
              <div className="flex gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handlePriorityChange(option.value)}
                    className={`
                      flex-1 px-3 py-2 rounded-md border-2 transition-all duration-200 text-sm font-medium
                      hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent
                      ${formData.priority === option.value
                        ? `${option.bgColor} ${option.borderColor} ${option.color} shadow-lg`
                        : 'bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30'
                      }
                    `}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-xs">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Priority indicator with animation */}
              <div className="mt-2 text-center">
                <div className={`
                  inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-all duration-300
                  ${priorityOptions.find(p => p.value === formData.priority)?.bgColor}
                  ${priorityOptions.find(p => p.value === formData.priority)?.color}
                `}>
                  <span className="mr-1">
                    {priorityOptions.find(p => p.value === formData.priority)?.icon}
                  </span>
                  Prioridade {priorityOptions.find(p => p.value === formData.priority)?.label}
                </div>
              </div>
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