interface Todo {
    id : number;
    title: string;
    description: string;
    status : TodoStatus;
    createdAt: Date;
}

enum TodoStatus {
    PENDING = 'PENDING',
    IN_PROGRESS = 'IN_PROGRES',
    COMPLETED = 'COMPLETED'
}

type NewTodo = Omit<Todo, 'id' | 'createdAt'>  

export { Todo, TodoStatus, NewTodo };