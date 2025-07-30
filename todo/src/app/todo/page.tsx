'use client'

import { useState } from 'react'
import { Plus, Calendar, Trash2, Check, X, Edit3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TodoForm from './todoForm'

// Tipos TypeScript
interface Task {
  id: string
  name: string
  date: string
  priority: 'baixa' | 'media' | 'alta'
  completed: boolean
  createdAt: Date
}

interface TaskFormData {
  name: string
  date: string
  priority: 'baixa' | 'media' | 'alta'
}

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    date: '',
    priority: 'media'
  })
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim() || !formData.date) return

    if (editingTask) {
      // Editar tarefa existente
      setTasks(prev => prev.map(task => 
        task.id === editingTask 
          ? { ...task, name: formData.name, date: formData.date, priority: formData.priority }
          : task
      ))
      setEditingTask(null)
    } else {
      // Adicionar nova tarefa
      const newTask: Task = {
        id: Date.now().toString(),
        name: formData.name,
        date: formData.date,
        priority: formData.priority,
        completed: false,
        createdAt: new Date()
      }
      setTasks(prev => [...prev, newTask])
    }

    // Reset form
    setFormData({ name: '', date: '', priority: 'media' })
    setIsFormVisible(false)
  }

  const toggleTaskComplete = (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id))
  }

  const startEditTask = (task: Task) => {
    setFormData({
      name: task.name,
      date: task.date,
      priority: task.priority
    })
    setEditingTask(task.id)
    setIsFormVisible(true)
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setFormData({ name: '', date: '', priority: 'media' })
    setIsFormVisible(false)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'text-red-400 bg-red-500/20'
      case 'media': return 'text-yellow-400 bg-yellow-500/20'
      case 'baixa': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'alta': return '🔴'
      case 'media': return '🟡'
      case 'baixa': return '🟢'
      default: return '⚪'
    }
  }

  const sortedTasks = [...tasks].sort((a, b) => {
    // Primeiro por completado (não completadas primeiro)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1
    }
    // Depois por prioridade
    const priorityOrder = { alta: 3, media: 2, baixa: 1 }
    return priorityOrder[b.priority] - priorityOrder[a.priority]
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[40rem] w-[40rem] bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 blur-3xl animate-pulse" />
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-2">
            Todo List
          </h1>
          <p className="text-gray-300 text-lg">
            Organize suas tarefas e aumente sua produtividade
          </p>
        </div>

        {/* Add Task Button */}
        {!isFormVisible && (
          <div className="text-center mb-8">
            <Button
              onClick={() => setIsFormVisible(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium transition-a"
              size="lg"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Tarefa
            </Button>
          </div>
        )}

        {/* Form */}
        {isFormVisible && (
            <TodoForm
              editingTask={editingTask}
              formData={formData}
              setFormData={setFormData}
              cancelEdit={cancelEdit}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
            />
        )}

        {/* Tasks List */}
        {!isFormVisible &&
            <div className="space-y-4 flex flex-col items-center justify-center">
            {sortedTasks.length === 0 ? (
                <Card className="w-full max-w-md relative z-10 backdrop-blur-sm bg-white/10 border-white/20">
                <CardContent className="p-12 text-center">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">
                    Nenhuma tarefa ainda
                    </h3>
                    <p className="text-white/80">
                    Adicione sua primeira tarefa para começar a organizar seu dia!
                    </p>
                </CardContent>
                </Card>
            ) : (
                sortedTasks.map((task) => (
                <Card
                    key={task.id}
                    className={`transition-all duration-300 hover:scale-[1.02] backdrop-blur-sm bg-white/10 border-white/20 ${
                    task.completed ? 'opacity-60' : ''
                    }`}
                >
                    <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                        <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-white/40 hover:border-green-400'
                            }`}
                        >
                            {task.completed && <Check className="h-3 w-3" />}
                        </button>

                        <div className="flex-1">
                            <h3
                            className={`font-medium ${
                                task.completed
                                ? 'line-through text-gray-400'
                                : 'text-white'
                            }`}
                            >
                            {task.name}
                            </h3>
                            <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-300 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(task.date).toLocaleDateString('pt-BR')}
                            </span>
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(
                                task.priority
                                )}`}
                            >
                                {getPriorityIcon(task.priority)} {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                            </div>
                        </div>
                        </div>

                        <div className="flex items-center space-x-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditTask(task)}
                            className="hover:bg-blue-500/20 text-white"
                        >
                            <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteTask(task.id)}
                            className="hover:bg-red-500/20 text-red-400"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                    </div>
                    </CardContent>
                </Card>
                ))
            )}
            </div>
        }
      </div>
    </div>
  )
}