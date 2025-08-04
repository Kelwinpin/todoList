export class CreatePriorityDto {
  description: string;
}

export class UpdatePriorityDto {
  description?: string;
}

export class PriorityResponseDto {
  id: number;
  description: string;
}
