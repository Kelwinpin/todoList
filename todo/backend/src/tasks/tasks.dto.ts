export class CreateTaskDto {
  title: string;
  description?: string;
  day_to_do: string;
  priority_id: number;
}

export class UpdateTaskDto {
  title?: string;
  description?: string;
  completed?: boolean;
  day_to_do?: string;
  priority_id?: number;
}

export class TaskResponseDto {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  day_to_do: Date;
  created_at: Date;
  updated_at: Date;
  user_id: number;
  priority_id: number;
  priority: {
    id: number;
    description: string;
  };
}
