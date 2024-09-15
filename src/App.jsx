import React, { useState, useEffect } from "react";
import { Calendar, Plus, CalendarDays, X, Trash2, Bookmark } from "lucide-react";
import {
  format,
  parseISO,
  isToday,
  isSameDay,
  isWeekend,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
  eachDayOfInterval,
} from "date-fns";
import { db, auth } from "./firebase";
import { ref, onValue, push, update, remove } from "firebase/database";
import "./App.css";
import Login from "./login.jsx";
import "./HobbyPage.css";

const HobbyPage = () => {
  const [hobbies, setHobbies] = useState([]);
  const [newHobby, setNewHobby] = useState("");
  const [error, setError] = useState(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const hobbiesRef = ref(db, `hobbies/${user.uid}`);
      const unsubscribe = onValue(hobbiesRef, (snapshot) => {
        try {
          const data = snapshot.val();
          if (data) {
            setHobbies(Object.entries(data).map(([key, value]) => ({ id: key, ...value })));
          } else {
            setHobbies([]);
          }
        } catch (error) {
          console.error("Error fetching hobbies:", error);
          setError("Error fetching hobbies. Please try again.");
        }
      }, (error) => {
        console.error("Error in onValue:", error);
        setError("Error connecting to the database. Please try again.");
      });

      return () => unsubscribe();
    }
  }, [user]);

  const addHobby = () => {
    if (newHobby.trim() !== "" && user) {
      const newHobbyItem = {
        name: newHobby,
        days: {},
      };
      push(ref(db, `hobbies/${user.uid}`), newHobbyItem)
        .then(() => {
          setNewHobby("");
        })
        .catch((error) => {
          console.error("Error adding hobby:", error);
          setError("Error adding hobby. Please try again.");
        });
    }
  };

  const toggleHobbyDay = (hobbyId, day) => {
    if (user) {
      const hobbyRef = ref(db, `hobbies/${user.uid}/${hobbyId}/days/${day}`);
      const currentValue = hobbies.find(h => h.id === hobbyId)?.days?.[day] || false;
      update(hobbyRef, !currentValue)
        .catch((error) => {
          console.error("Error updating hobby day:", error);
          setError("Error updating hobby. Please try again.");
        });
    }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user) {
    return <div>Please log in to view your hobbies.</div>;
  }

  return (
    <div className="hobby-page">
      <h2 className="text-xl font-bold mb-4 text-center">Hobbies</h2>
      <div className="mb-4">
        <input
          type="text"
          value={newHobby}
          onChange={(e) => setNewHobby(e.target.value)}
          placeholder="Add a new hobby"
          className="w-full p-2 border rounded"
        />
        <button
          onClick={addHobby}
          className="bg-blue-500 text-white px-4 py-2 rounded mt-2 w-full"
        >
          Add Hobby
        </button>
      </div>
      {hobbies.length > 0 ? (
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Hobby</th>
              {days.map(day => (
                <th key={day} className="text-center">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hobbies.map(hobby => (
              <tr key={hobby.id}>
                <td>{hobby.name}</td>
                {days.map(day => (
                  <td key={day} className="text-center">
                    <input
                      type="checkbox"
                      checked={hobby.days?.[day] || false}
                      onChange={() => toggleHobbyDay(hobby.id, day)}
                      className="h-5 w-5"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hobbies added yet. Add your first hobby above!</p>
      )}
    </div>
  );
};


const AddTopicPopup = ({ onClose, onAddTopic, topic = null }) => {
  const [topicTitle, setTopicTitle] = useState(topic ? topic.title : "");
  const [todos, setTodos] = useState(topic ? topic.todos : []);
  const [newTodo, setNewTodo] = useState("");

  const handleAddTodo = () => {
    if (newTodo.trim() !== "") {
      setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
      setNewTodo("");
    }
  };

  const handleAddTopic = () => {
    if (topicTitle.trim() !== "") {
      onAddTopic(topicTitle, todos, topic ? topic.id : null);
      onClose();
    }
  };

  const handleDeleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3 className="text-xl font-bold mb-4">
          {topic ? "Edit Topic" : "Add New Topic"}
        </h3>
        <input
          type="text"
          value={topicTitle}
          onChange={(e) => setTopicTitle(e.target.value)}
          placeholder="Topic Title"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="mb-4">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder="Add a new task"
            className="w-full p-2 border rounded"
          />
          <button
            onClick={handleAddTodo}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>
        <ul className="mb-4">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center justify-between mb-2"
            >
              <span>{todo.text}</span>
              <button
                onClick={() => handleDeleteTodo(todo.id)}
                className="text-red-500"
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex justify-between">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
          <button
            onClick={handleAddTopic}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            {topic ? "Update Topic" : "Create Topic"}
          </button>
        </div>
      </div>
    </div>
  );
};

const TodoApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("hobby");
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isRepeating, setIsRepeating] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const todosRef = ref(db, `todos/${user.uid}`);
      const topicsRef = ref(db, `topics/${user.uid}`);

      const todosUnsubscribe = onValue(
        todosRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setTodos(
              Object.entries(data).map(([key, value]) => ({
                ...value,
                id: key,
              }))
            );
          } else {
            setTodos([]);
          }
        },
        (error) => {
          console.error("Error fetching todos:", error);
          setError("Error fetching todos. Please try again.");
        }
      );

      const topicsUnsubscribe = onValue(
        topicsRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            setTopics(
              Object.entries(data).map(([key, value]) => ({
                ...value,
                id: key,
              }))
            );
          } else {
            setTopics([]);
          }
        },
        (error) => {
          console.error("Error fetching topics:", error);
          setError("Error fetching topics. Please try again.");
        }
      );

      return () => {
        todosUnsubscribe();
        topicsUnsubscribe();
      };
    }
  }, [user]);

  const addTodo = () => {
    if (newTodo.trim() !== "" && user) {
      const newTodoItem = {
        text: newTodo,
        completed: false,
        date: format(selectedDate, "yyyy-MM-dd"),
        repeating: isRepeating,
        repeatInterval: isRepeating ? getRepeatInterval() : null,
        type: activeTab,
        userId: user.uid,
      };
      push(ref(db, `todos/${user.uid}`), newTodoItem);
      setNewTodo("");
      setIsRepeating(false);
    }
  };

  const getRepeatInterval = () => {
    switch (activeTab) {
      case "daily":
        return 1;
      case "weekly":
        return 7;
      case "monthly":
        return 30;
      default:
        return null;
    }
  };

  const toggleTodoCompletion = (id) => {
    const todoRef = ref(db, `todos/${user.uid}/${id}`);
    update(todoRef, {
      completed: !todos.find((todo) => todo.id === id).completed,
      lastCompletedDate: new Date().toISOString(),
    });
  };

  const deleteTodo = (id) => {
    const todoRef = ref(db, `todos/${user.uid}/${id}`);
    remove(todoRef);
  };

  const handleAddTopic = (title, topicTodos, topicId = null) => {
    if (topicId) {
      const topicRef = ref(db, `topics/${user.uid}/${topicId}`);
      update(topicRef, { title, todos: topicTodos });
    } else {
      const newTopic = {
        title: title,
        todos: topicTodos,
        userId: user.uid,
      };
      push(ref(db, `topics/${user.uid}`), newTopic);
    }
  };

  const handleDeleteTopic = (topicId) => {
    const topicRef = ref(db, `topics/${user.uid}/${topicId}`);
    remove(topicRef);
  };

  const getVisibleTodos = () => {
    return todos.filter((todo) => todo.type === activeTab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "hobby":
        return <HobbyPage />;
      case "daily":
      case "weekly":
      case "monthly":
        return (
          <div className="content">
            <h2 className="text-xl font-bold mb-4 text-center">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <div className="mb-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a new task"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4 flex justify-between items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isRepeating}
                  onChange={() => setIsRepeating(!isRepeating)}
                  className="mr-2"
                />
                <span>
                  Repeating{" "}
                  {isRepeating ? `every ${getRepeatInterval()} day(s)` : ""}
                </span>
              </label>
              <button
                onClick={addTodo}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Add
              </button>
            </div>
            <ul className="mt-4">
              {getVisibleTodos().map((todo) => (
                <li key={todo.id} className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodoCompletion(todo.id)}
                    className="mr-2"
                  />
                  <span className={todo.completed ? "line-through" : ""}>
                    {todo.text}
                  </span>
                  {todo.repeating && (
                    <span className="ml-2 text-sm text-gray-500">
                      (Repeating)
                    </span>
                  )}
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="ml-auto text-red-500"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      case "calendar":
        const changeMonth = (increment) => {
          setSelectedDate((prevDate) => addMonths(prevDate, increment));
        };

        // Calcola il primo giorno del mese e i giorni del mese precedente da mostrare
        const firstDayOfMonth = startOfMonth(selectedDate);
        const startDate = startOfWeek(firstDayOfMonth, { weekStartsOn: 1 });

        // Calcola l'ultimo giorno del mese e i giorni del mese successivo da mostrare
        const lastDayOfMonth = endOfMonth(selectedDate);
        const endDate = endOfWeek(lastDayOfMonth, { weekStartsOn: 1 });
        return (
          <div className="content">
            <h2 className="text-xl font-bold mb-4 text-center">Calendar</h2>
            <div className="todo-input-container">
              <div className="todo-text-input-container">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  placeholder="Add a new task"
                  className="todo-text-input"
                />
              </div>
              <div className="todo-date-button-container">
                <input
                  type="date"
                  value={format(selectedDate, "yyyy-MM-dd")}
                  onChange={(e) => setSelectedDate(parseISO(e.target.value))}
                  className="todo-date-input"
                />
                <button onClick={addTodo} className="todo-add-button">
                  Add
                </button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="text-center font-bold">
                  {day}
                </div>
              ))}
              {eachDayOfInterval({ start: startDate, end: endDate }).map(
                (date) => {
                  const dayTodos = todos.filter((todo) =>
                    isSameDay(parseISO(todo.date), date)
                  );
                  const isCurrentMonth =
                    date.getMonth() === selectedDate.getMonth();
                  return (
                    <div
                      key={date.toISOString()}
                      className={`
                      p-2 border text-left cursor-pointer overflow-hidden
                      ${isToday(date) ? "bg-yellow-100" : ""}
                      ${isWeekend(date) ? "text-red-500" : ""}
                      ${isSameDay(date, selectedDate) ? "bg-blue-100" : ""}
                      ${!isCurrentMonth ? "text-gray-400" : ""}
                    `}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className="font-bold">{format(date, "d")}</div>
                      <div className="text-xs">
                        {dayTodos.map((todo) => (
                          <div
                            key={todo.id}
                            className={`truncate ${
                              todo.completed ? "line-through" : ""
                            }`}
                            title={todo.text}
                          >
                            {todo.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => changeMonth(-1)}
                className="bg-gray-200 px-3 py-1 rounded"
              >
                &lt;
              </button>
              <div className="font-bold">
                {format(selectedDate, "MMMM yyyy")}
              </div>
              <button
                onClick={() => changeMonth(1)}
                className="bg-gray-200 px-3 py-1 rounded"
              >
                &gt;
              </button>
            </div>
            <div>
              <h3 className="font-bold mb-2">
                Events for {format(selectedDate, "MMMM d, yyyy")}
              </h3>
              <ul>
                {todos
                  .filter((todo) =>
                    isSameDay(parseISO(todo.date), selectedDate)
                  )
                  .map((todo) => (
                    <li key={todo.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => toggleTodoCompletion(todo.id)}
                        className="mr-2"
                      />
                      <span className={todo.completed ? "line-through" : ""}>
                        {todo.text}
                      </span>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        className="ml-auto text-red-500"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        );
      case "other":
        return (
          <div className="content">
            <h2 className="text-xl font-bold mb-4 text-center">Topics</h2>
            <button
              onClick={() => {
                setSelectedTopic(null);
                setShowPopup(true);
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded mb-4 w-full"
            >
              Add Topic
            </button>
            {topics.map((topic) => (
              <div key={topic.id} className="mb-4 border p-4 rounded topic">
                <div className="flex justify-between items-center mb-2">
                  <h3
                    className="font-bold cursor-pointer"
                    onClick={() => {
                      setSelectedTopic(topic);
                      setShowPopup(true);
                    }}
                  >
                    {topic.title}
                  </h3>
                  <button
                    onClick={() => handleDeleteTopic(topic.id)}
                    className="text-red-500"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                <ul>
                  {topic.todos.map((todo) => (
                    <li key={todo.id} className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => {
                          const updatedTopics = topics.map((t) =>
                            t.id === topic.id
                              ? {
                                  ...t,
                                  todos: t.todos.map((td) =>
                                    td.id === todo.id
                                      ? { ...td, completed: !td.completed }
                                      : td
                                  ),
                                }
                              : t
                          );
                          setTopics(updatedTopics);
                        }}
                        className="mr-2"
                      />
                      <span className={todo.completed ? "line-through" : ""}>
                        {todo.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  console.log("Rendering TodoApp");
  if (loading) {
    console.log("Loading...");
    return <div>Loading...</div>;
  }
  if (error) {
    console.log("Error:", error);
    return <div>Error: {error}</div>;
  }
  if (!user) {
    console.log("No user, showing login");
    return <Login onLogin={setUser} />;
  }
  console.log("User logged in, rendering content");

  return (
    <div className="container mx-auto p-4 max-w-md">
      {renderContent()}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2">
        <button onClick={() => setActiveTab("hobby")} className="p-2">
          <Bookmark size={24} />
          <div className="text-xs">Hobby</div>
        </button>
        <button onClick={() => setActiveTab("daily")} className="p-2">
          <CalendarDays size={24} />
          <div className="text-xs">1</div>
        </button>
        <button onClick={() => setActiveTab("weekly")} className="p-2">
          <CalendarDays size={24} />
          <div className="text-xs">7</div>
        </button>
        <button onClick={() => setActiveTab("monthly")} className="p-2">
          <CalendarDays size={24} />
          <div className="text-xs">30</div>
        </button>
        <button onClick={() => setActiveTab("calendar")} className="p-2">
          <Calendar size={24} />
        </button>
        <button onClick={() => setActiveTab("other")} className="p-2">
          <Plus size={24} />
        </button>
      </div>
      {showPopup && (
        <AddTopicPopup
          onClose={() => {
            setShowPopup(false);
            setSelectedTopic(null);
          }}
          onAddTopic={handleAddTopic}
          topic={selectedTopic}
        />
      )}
    </div>
  );
};

export default TodoApp;
