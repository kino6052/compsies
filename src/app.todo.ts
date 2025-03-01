import { c, geUseState } from "./compsies/compsies";
import { render } from "./compsies/dom/render";

// Define Todo type
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// Root element reference
const rootElement = document.querySelector("#root") as HTMLElement;

// Helper function to re-render the application with debouncing
let renderTimeout: number | null = null;
const renderApp = (): void => {
  if (renderTimeout) {
    clearTimeout(renderTimeout);
  }
  renderTimeout = setTimeout(() => {
    render(App(), rootElement);
    renderTimeout = null;
  }, 10) as unknown as number;
};

// Initialize state hooks once, outside of components
const todosState = geUseState<Todo[]>([
  { id: 1, text: "Learn Tiny React", completed: false },
  { id: 2, text: "Build a Todo App", completed: false }
], renderApp);
const newTodoTextState = geUseState<string>("", renderApp);

// Header component
const Header = ({ title }: { title: string }) => {
  return c(
    "header", 'header-id', {},
    [
      c("h1", 'heading-id', {}, [title], "h1")
    ],
    "header"
  );
};

// TodoItem component
const TodoItem = ({ todo, onToggle, onDelete }: { todo: Todo, onToggle: (id: number) => void, onDelete: (id: number) => void }) => {
  return c(
    "li", `todo-${todo.id}`,
    {
      style: {
        textDecoration: todo.completed ? "line-through" : "none",
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0"
      }
    },
    [
      c("span", `todo-text-${todo.id}`, {
        onclick: () => onToggle(todo.id)
      }, [todo.text], "span"),
      c("button", `delete-${todo.id}`, {
        onclick: () => onDelete(todo.id),
        style: { marginLeft: "10px" }
      }, ["Delete"], "button")
    ],
    "li"
  );
};

// TodoList component
const TodoList = ({ todos, onToggleTodo, onDeleteTodo }: { todos: Todo[], onToggleTodo: (id: number) => void, onDeleteTodo: (id: number) => void }) => {
  return c(
    "ul", 'todo-list-id',
    { style: { listStyleType: "none", padding: "0" } },
    todos.map(todo => TodoItem({
      todo,
      onToggle: onToggleTodo,
      onDelete: onDeleteTodo
    })),
    "ul"
  );
};

// TodoForm component
const TodoForm = ({ newTodoText, onInputChange, onAddTodo }: {
  newTodoText: string,
  onInputChange: (text: string) => void,
  onAddTodo: () => void
}) => {
  return c(
    "form", 'todo-form-id',
    {
      onsubmit: (e: Event) => {
        e.preventDefault();
        onAddTodo();
      },
      style: {
        display: "flex",
        marginBottom: "20px"
      }
    },
    [
      c("input", 'new-todo-input', {
        type: "text",
        value: newTodoText,
        oninput: (e: Event) => onInputChange((e.target as HTMLInputElement).value),
        placeholder: "Add a new todo",
        style: { flex: "1", padding: "8px" }
      }, [], "input"),
      c("button", 'add-todo-button', {
        type: "submit",
        style: { marginLeft: "10px", padding: "8px 16px" }
      }, ["Add"], "button")
    ],
    "form"
  );
};

// Stats component
const Stats = ({ todos }: { todos: Todo[] }) => {
  const completed = todos.filter(todo => todo.completed).length;
  const remaining = todos.length - completed;

  return c(
    "div", 'stats-id',
    { style: { marginTop: "20px" } },
    [
      c("p", 'stats-text-id', {},
        [`${remaining} items left, ${completed} completed`],
        "p")
    ],
    "div"
  );
};

// Main App component
const App = () => {
  // Use state hooks for application state
  const [getTodos, setTodos] = todosState();
  const [getNewTodoText, setNewTodoText] = newTodoTextState();

  // Event handlers
  const handleToggleTodo = (id: number): void => {
    const updatedTodos = getTodos().map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
    setTodos(updatedTodos);
  };

  const handleDeleteTodo = (id: number): void => {
    const filteredTodos = getTodos().filter(todo => todo.id !== id);
    setTodos(filteredTodos);
  };

  const handleInputChange = (text: string): void => {
    setNewTodoText(text);
  };

  const handleAddTodo = (): void => {
    const newTodoText = getNewTodoText().trim();
    if (newTodoText) {
      const todos = getTodos();
      const newId = todos.length > 0
        ? Math.max(...todos.map(t => t.id)) + 1
        : 1;

      setTodos([
        ...todos,
        {
          id: newId,
          text: newTodoText,
          completed: false
        }
      ]);

      setNewTodoText("");
    }
  };

  return c(
    "div", 'container-id',
    { style: { maxWidth: "500px", margin: "0 auto", padding: "20px" } },
    [
      Header({ title: "Todo App" }),
      TodoForm({
        newTodoText: getNewTodoText(),
        onInputChange: handleInputChange,
        onAddTodo: handleAddTodo
      }),
      TodoList({
        todos: getTodos(),
        onToggleTodo: handleToggleTodo,
        onDeleteTodo: handleDeleteTodo
      }),
      Stats({ todos: getTodos() })
    ],
    "div"
  );
};

// Initial render
renderApp();
