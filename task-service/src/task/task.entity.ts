export interface Task {
  location: string;
  status: string;
}

// yazım yanlışı olmayacak

// Task
// status enum olacak ve 3 farklı değer alacak (TODO, IN_PROGRESS, DONE)
// createdAt ve updatedAt alanı olacak ve otomatik oluşacak

// Structure
// no unique olacak (her stucture bazında unique olacak) (Build, Floor,Space)

// create update, delete işlemlerinde loglama yapılıyor mu ?

// frontend
// structure create,update, delete
// task create,update, delete
// task kanban board (en sonunda yapılacak)
