'use client'

import { useEffect, useState } from 'react'
import { Plus, Calendar, Trash2, Check, X, Edit3, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { LoadingSpinner } from '@/components/ui/loading'
import { useLoading, useMultipleLoading } from '@/hooks/useLoading'
import TodoForm from './todoForm'
import { apiService } from '@/services/api'
import { toast } from 'sonner'

// Tipos TypeScript
interface Task {
  id: string
  title: string
  description: string
  day_to_do: string | Date
  priority_id: number
  completed: boolean
  createdAt: Date
}

interface Priority {
  id: number
  description: string
}

interface TodoFormData {
  title: string
  description: string
  day_to_do: Date
  priority_id: number
}

export default function TodoPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [priorities, setPriorities] = useState<Priority[]>([])
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editingData, setEditingData] = useState<TodoFormData | undefined>()
  
  // Using custom loading hook
  const { isLoading, withLoading } = useLoading(true)
  const { loadingStates, withLoading: withSpecificLoading } = useMultipleLoading([
    'addTask', 
    'editTask', 
    'deleteTask', 
    'toggleComplete'
  ])

  const handleFormSubmit = async (data: TodoFormData) => {
    const actionKey = editingTask ? 'editTask' : 'addTask'
    
    // Convert Date to string format for API
    const apiData = {
      ...data,
      day_to_do: data.day_to_do.toISOString().split('T')[0] // YYYY-MM-DD format
    }
    
    await withSpecificLoading(actionKey, async () => {
      try {
        if (editingTask) {
          await apiService.patch(`/tasks/${editingTask}`, apiData)
          setTasks(prev => prev.map(task => 
            task.id === editingTask 
              ? { ...task, ...apiData }
              : task
          ))
          setEditingTask(null)
          
          toast("Tarefa atualizada com sucesso", {
            icon: <Check className="h-5 w-5" />,
            duration: 3000,
            style: {
              background: "rgba(0, 211, 0, 0.8)",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
            },
            position: "top-center",
          })
        } else {
          const response = await apiService.post('/tasks', apiData)
          setTasks(prev => [...prev, response])

          toast("Tarefa adicionada com sucesso", {
            icon: <Check className="h-5 w-5" />,
            duration: 3000,
            style: {
              background: "green",
              color: "white",
              padding: "10px",
              borderRadius: "5px",
            },
            position: "top-center",
          })
        }
      } catch (error: any) {
        toast(`Erro ao ${editingTask ? 'atualizar' : 'adicionar'} tarefa: ` + error.message, {
          icon: <AlertCircle className="h-5 w-5" />,
          duration: 3000,
          position: "top-center",
          style: {
            background: "red",
            color: "white",
            border: "none",
            padding: "10px",
            borderRadius: "5px",
          },
        })
        throw error
      }
    })
    
    // Reset form
    setIsFormVisible(false)
    setEditingData(undefined)
  }

  const toggleTaskComplete = async (id: string) => {
    await withSpecificLoading('toggleComplete', async () => {
      const task = tasks.find(t => t.id === id)
      if (!task) return
      
      await apiService.patch(`/tasks/${id}`, { completed: !task.completed })
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      ))
    })
  }

  const deleteTask = async (id: string) => {
    await withSpecificLoading('deleteTask', async () => {
      await apiService.delete(`/tasks/${id}`)
      setTasks(prev => prev.filter(task => task.id !== id))
      
      toast("Tarefa excluída com sucesso", {
        icon: <Check className="h-5 w-5" />,
        duration: 3000,
        style: {
          background: "rgba(0, 211, 0, 0.8)",
          color: "white",
          padding: "10px",
          borderRadius: "5px",
        },
        position: "top-center",
      })
    })
  }

  const startEditTask = (task: Task) => {
    setEditingData({
      title: task.title,
      description: task.description,
      day_to_do: typeof task.day_to_do === 'string' ? new Date(task.day_to_do) : task.day_to_do,
      priority_id: task.priority_id
    })
    setEditingTask(task.id)
    setIsFormVisible(true)
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setEditingData(undefined)
    setIsFormVisible(false)
  }

  const getPriorityColor = (priorityId: number) => {
    const priority = priorities.find(p => p.id === priorityId)
    if (!priority) return 'text-gray-400 bg-gray-500/20'
    
    switch (priority.description.toLowerCase()) {
      case 'alta': return 'text-red-400 bg-red-500/20'
      case 'média': case 'media': return 'text-yellow-400 bg-yellow-500/20'
      case 'baixa': return 'text-green-400 bg-green-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const getPriorityIcon = (priorityId: number) => {
    const priority = priorities.find(p => p.id === priorityId)
    if (!priority) return '⚪'
    
    switch (priority.description.toLowerCase()) {
      case 'alta': return '🔴'
      case 'média': case 'media': return '🟡'
      case 'baixa': return '🟢'
      default: return '⚪'
    }
  }

  const loadData = async () => {
    await withLoading(async () => {
      try {
        const [tasksResponse, prioritiesResponse] = await Promise.all([
          apiService.get('/tasks'),
          apiService.get('/priorities')
        ])
        setTasks(tasksResponse)
        setPriorities(prioritiesResponse)
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
        toast("Erro ao carregar dados", {
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
      }
    })
  }

  useEffect(() => {  
    loadData()
  }, [])

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
        {!isFormVisible && !isLoading && (
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

        {/* Loading Button Skeleton */}
        {isLoading && (
          <div className="text-center mb-8">
            <Skeleton className="h-10 w-32 mx-auto bg-white/20" />
          </div>
        )}

        {/* Form */}
        {isFormVisible && (
            <TodoForm
              editingTask={editingTask}
              priorities={priorities}
              onSubmit={handleFormSubmit}
              onCancel={cancelEdit}
              initialData={editingData}
              isSubmitting={loadingStates.addTask || loadingStates.editTask}
            />
        )}

        {/* Tasks List */}
        {!isFormVisible &&
            <div className="space-y-4 flex flex-col items-center justify-center">
            {isLoading ? (
                // Skeleton Loading
                Array.from({ length: 3 }).map((_, index) => (
                  <Card key={index} className="w-full max-w-lg relative z-10 backdrop-blur-sm bg-white/10 border-white/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
                          <Skeleton className="h-6 w-6 rounded-full bg-white/20" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-2 bg-white/20" />
                            <Skeleton className="h-3 w-1/2 mb-2 bg-white/20" />
                            <div className="flex items-center space-x-4">
                              <Skeleton className="h-3 w-20 bg-white/20" />
                              <Skeleton className="h-5 w-16 rounded-full bg-white/20" />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Skeleton className="h-8 w-8 bg-white/20" />
                          <Skeleton className="h-8 w-8 bg-white/20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : tasks.length === 0 ? (
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
                tasks.map((task) => (
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
                            disabled={loadingStates.toggleComplete}
                            className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            task.completed
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-white/40 hover:border-green-400'
                            } ${loadingStates.toggleComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loadingStates.toggleComplete ? (
                              <LoadingSpinner size="sm" className="text-white" />
                            ) : (
                              task.completed && <Check className="h-3 w-3" />
                            )}
                        </button>

                        <div className="flex-1">
                            <h3
                            className={`font-medium ${
                                task.completed
                                ? 'line-through text-gray-400'
                                : 'text-white'
                            }`}
                            >
                            {task.title}
                            </h3>
                            <p className={`text-sm mt-1 ${
                                task.completed
                                ? 'line-through text-gray-500'
                                : 'text-gray-300'
                            }`}>
                            {task.description}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-300 flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(task.day_to_do).toLocaleDateString('pt-BR')}
                            </span>
                            <span
                                className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority_id)}`}
                            >
                                {getPriorityIcon(task.priority_id)} {priorities.find(p => p.id === task.priority_id)?.description || 'N/A'}
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
                            disabled={loadingStates.deleteTask}
                            className="hover:bg-red-500/20 text-red-400 disabled:opacity-50"
                        >
                            {loadingStates.deleteTask ? (
                              <LoadingSpinner size="sm" className="text-red-400" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
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