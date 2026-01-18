import { DatePipe , NgClass } from '@angular/common';
import { Component, OnInit, signal , computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

export class TodoItemModel {
  todoItem!: string;
  createdDate!: Date;
  status!: 'Pending' | 'Done';
  todoItemId!: number;

  constructor() {
    this.todoItem = '';
    this.createdDate = new Date();
    this.status = 'Pending';
    this.todoItemId = 0;
  }
}


@Component({
  selector: 'app-todoApp',
  imports: [FormsModule, NgClass,DatePipe],
  templateUrl: './todo-app.html',
  styleUrl: './todo-app.css',
})
export class TodoApp implements OnInit {


  newTask = new TodoItemModel();
  localKeyName: string = 'todoItems';

  todoList = signal<TodoItemModel[]>([]);
  searchText = signal<string>('');
  sortMode = signal<string>('date-desc');

 
  filteredTodos = computed(() => {
    let items = [...this.todoList()];

    if (this.searchText().trim() !== '') {
      const searchLower = this.searchText().toLowerCase();
      items = items.filter(x =>
        x.todoItem.toLowerCase().includes(searchLower)
      );
    }

   
    switch (this.sortMode()) {
      case 'date-asc':
        items.sort((a, b) => +a.createdDate - +b.createdDate);
        break;
      case 'date-desc':
        items.sort((a, b) => +b.createdDate - +a.createdDate);
        break;
    }

    return items;
  });

  ngOnInit(): void {
    const localData = localStorage.getItem(this.localKeyName);
    if (localData != null) {
      const parsed = JSON.parse(localData).map((x: any) => ({
        ...x,
        createdDate: new Date(x.createdDate),
      }));
      this.todoList.set(parsed);
    }
  }

  onSaveNewTask() {
    this.generateNewId();

    const clone = structuredClone(this.newTask);

    this.todoList.update(old => [...old, clone]);
    this.saveLocal();

    this.newTask = new TodoItemModel();
  }

  toggleStatus(item: TodoItemModel) {
    item.status = item.status === 'Pending' ? 'Done' : 'Pending';
    this.todoList.update(list => [...list]);
    this.saveLocal();
  }

  deleteTask(item: TodoItemModel) {
    this.todoList.update(list =>
      list.filter(x => x.todoItemId !== item.todoItemId)
    );
    this.saveLocal();
  }

  generateNewId() {
    this.newTask.todoItemId = Date.now();
  }

  saveLocal() {
    localStorage.setItem(this.localKeyName, JSON.stringify(this.todoList()));
  }
}