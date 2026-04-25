import { useState, useRef, useEffect } from 'react'

function TodoItem({ todo, onToggle, onDelete, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const [draftDate, setDraftDate] = useState(todo.dueDate || '')
  const inputRef = useRef(null)
  const dateInputRef = useRef(null)
  const editingRef = useRef(false)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const enterEdit = () => {
    setDraft(todo.text)
    setDraftDate(todo.dueDate || '')
    setEditing(true)
    editingRef.current = true
  }

  const commit = () => {
    if (!editingRef.current) return
    editingRef.current = false
    setEditing(false)
    const trimmed = draft.trim()
    if (trimmed === '') {
      onDelete(todo.id)
    } else {
      onSave(todo.id, trimmed, draftDate)
    }
  }

  const cancel = () => {
    editingRef.current = false
    setEditing(false)
    setDraft(todo.text)
    setDraftDate(todo.dueDate || '')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target === inputRef.current) commit()
    if (e.key === 'Escape') cancel()
  }

  const handleTextInputBlur = () => {
    // Delay commit to allow date input to receive focus
    setTimeout(() => {
      if (editingRef.current && document.activeElement !== dateInputRef.current) {
        commit()
      }
    }, 50)
  }

  const handleDateInputBlur = () => {
    // Commit when leaving the date input
    setTimeout(() => {
      if (editingRef.current) {
        commit()
      }
    }, 50)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    // Split the date string to avoid timezone issues
    const [year, month, day] = dateStr.split('-')
    const date = new Date(year, month - 1, day)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <li className="flex flex-col gap-2 px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50">
      <div className="flex items-center gap-3">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleTextInputBlur}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-0.5 border border-indigo-400 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            aria-label="Edit todo"
          />
        ) : (
          <button
            onClick={() => onToggle(todo.id)}
            onDoubleClick={enterEdit}
            className={`flex-1 text-left ${
              todo.done ? 'line-through text-slate-400' : 'text-slate-800'
            }`}
          >
            {todo.text}
          </button>
        )}
        <button
          onClick={() => onDelete(todo.id)}
          className="text-slate-400 hover:text-red-500 text-lg font-bold px-2"
          aria-label="Delete todo"
        >
          ×
        </button>
      </div>
      
      {editing && (
        <div className="flex gap-2 items-center pl-0">
          <label className="text-xs text-slate-600">Due date:</label>
          <input
            ref={dateInputRef}
            type="date"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
            onBlur={handleDateInputBlur}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancel()
            }}
            className="px-2 py-1 border border-indigo-400 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-800"
            aria-label="Edit due date"
          />
          {draftDate && (
            <button
              type="button"
              onClick={() => setDraftDate('')}
              className="text-xs text-slate-400 hover:text-slate-600 px-1"
            >
              Clear
            </button>
          )}
        </div>
      )}
      
      {!editing && todo.dueDate && (
        <div className="text-xs text-slate-500 pl-0">
          📅 {formatDate(todo.dueDate)}
        </div>
      )}
    </li>
  )
}

export default function App() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Read a book', done: false, dueDate: '' },
    { id: 2, text: 'Go for a walk', done: true, dueDate: '' },
    { id: 3, text: 'Write some code', done: false, dueDate: '' },
  ])
  const [input, setInput] = useState('')
  const [inputDate, setInputDate] = useState('')
  const [filter, setFilter] = useState('all')

  const addTodo = () => {
    const text = input.trim()
    if (!text) return
    setTodos([...todos, { id: Date.now(), text, done: false, dueDate: inputDate }])
    setInput('')
    setInputDate('')
  }

  const toggleTodo = (id) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))

  const deleteTodo = (id) => setTodos(todos.filter((t) => t.id !== id))

  const saveTodo = (id, newText, newDueDate) =>
    setTodos(todos.map((t) => (t.id === id ? { ...t, text: newText, dueDate: newDueDate } : t)))

  const visible = todos.filter((t) =>
    filter === 'active' ? !t.done : filter === 'completed' ? t.done : true,
  )

  const remaining = todos.filter((t) => !t.done).length

  const tabClass = (name) =>
    `px-3 py-1 rounded-md text-sm font-medium transition ${
      filter === name
        ? 'bg-indigo-600 text-white'
        : 'text-slate-600 hover:bg-slate-200'
    }`

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-16 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Todo List</h1>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addTodo()}
              placeholder="What needs doing?"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addTodo}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 transition"
            >
              Add
            </button>
          </div>
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              aria-label="Due date for new todo"
            />
            {inputDate && (
              <button
                type="button"
                onClick={() => setInputDate('')}
                className="text-sm text-slate-400 hover:text-slate-600 px-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button onClick={() => setFilter('all')} className={tabClass('all')}>
            All
          </button>
          <button onClick={() => setFilter('active')} className={tabClass('active')}>
            Active
          </button>
          <button onClick={() => setFilter('completed')} className={tabClass('completed')}>
            Completed
          </button>
        </div>

        <ul className="space-y-2">
          {visible.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
              onSave={saveTodo}
            />
          ))}
          {visible.length === 0 && (
            <li className="text-center text-slate-400 py-4 text-sm">
              Nothing here.
            </li>
          )}
        </ul>

        <div className="mt-4 text-sm text-slate-500">
          {remaining} {remaining === 1 ? 'item' : 'items'} left
        </div>
      </div>
    </div>
  )
}
