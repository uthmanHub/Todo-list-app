import React, { useEffect, useRef, useState } from "react";
import { CiCalendarDate } from "react-icons/ci";
import {
  FaChevronDown,
  FaChevronUp,
  FaPencil,
  FaPlus,
  FaTrash,
} from "react-icons/fa6";
import { PiGitBranchLight } from "react-icons/pi";
import TaskData from "../../TaskData.json";

const App = () => {
  const [tasks, setTasks] = useState(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks"));
    return storedTasks || TaskData;
  });
  const [taskInput, setTaskInput] = useState("");
  const [subtaskInputs, setSubtaskInputs] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editTaskInput, setEditTaskInput] = useState("");
  const [editSubtaskInputs, setEditSubtaskInputs] = useState([]);
  const [showTaskDetails, setShowTaskDetails] = useState(false);
  const taskInputRef = useRef(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleTaskInputChange = e => {
    setTaskInput(e.target.value);
  };

  const handleSubtaskInputChange = (index, value) => {
    const newSubtaskInputs = [...subtaskInputs];
    newSubtaskInputs[index] = value;
    setSubtaskInputs(newSubtaskInputs);
  };

  const handleEditSubtaskInputChange = (index, value) => {
    const newEditSubtaskInputs = [...editSubtaskInputs];
    newEditSubtaskInputs[index] = value;
    setEditSubtaskInputs(newEditSubtaskInputs);
  };

  const addSubtaskInput = () => {
    setSubtaskInputs([...subtaskInputs, ""]);
  };

  const handleAddTask = () => {
    if (taskInput.trim()) {
      const newTask = {
        task: taskInput,
        subtasks: subtaskInputs
          .filter(subtask => subtask.trim() !== "")
          .map(subtask => ({ text: subtask, completed: false })),
        completed: false,
        createdDay: new Date().toLocaleDateString("en-US", {
          weekday: "long",
        }),
      };
      setTasks([...tasks, newTask]);
      setTaskInput("");
      setSubtaskInputs([]);
      taskInputRef.current.focus();
    }
  };

  const handleRemoveTask = index => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const handleEditTask = index => {
    setIsEditing(true);
    setEditIndex(index);
    setEditTaskInput(tasks[index].task);
    setEditSubtaskInputs(tasks[index].subtasks.map(subtask => subtask.text));
  };

  const handleToggleComplete = index => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const handleToggleSubtaskComplete = (taskIndex, subtaskIndex) => {
    const newTasks = [...tasks];
    newTasks[taskIndex].subtasks[subtaskIndex].completed =
      !newTasks[taskIndex].subtasks[subtaskIndex].completed;
    setTasks(newTasks);
  };

  const handleSaveEditedTask = () => {
    if (editTaskInput.trim()) {
      const updatedTasks = [...tasks];
      updatedTasks[editIndex] = {
        ...updatedTasks[editIndex],
        task: editTaskInput,
        subtasks: editSubtaskInputs
          .filter(subtask => subtask.trim() !== "")
          .map((subtask, index) => ({
            ...updatedTasks[editIndex].subtasks[index],
            text: subtask,
          })),
      };
      setTasks(updatedTasks);
      setIsEditing(false);
      setEditIndex(null);
      setEditTaskInput("");
      setEditSubtaskInputs([]);
    }
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  const handleDragStart = index => {
    setDraggedIndex(index);
  };

  const handleDragOver = index => {
    if (draggedIndex !== null && draggedIndex !== index) {
      setHoveredIndex(index);
    }
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && hoveredIndex !== null) {
      const updatedTasks = [...tasks];
      const draggedTask = updatedTasks[draggedIndex];
      updatedTasks.splice(draggedIndex, 1);
      updatedTasks.splice(hoveredIndex, 0, draggedTask);
      setTasks(updatedTasks);
      setDraggedIndex(null);
      setHoveredIndex(null);
    }
  };

  const handleDrop = index => {
    setHoveredIndex(index);
  };

  return (
    <div className='task-board' style={{ padding: "" }}>
      <h1>To-Do List</h1>

      <div className='input-task-wrapper'>
        <div className='input-task'>
          <div className='input-container'>
            <button onClick={addSubtaskInput}>
              <FaPlus className='icon' />{" "}
            </button>
            <input
              ref={taskInputRef}
              type='text'
              value={taskInput}
              onChange={handleTaskInputChange}
              placeholder='Enter task'
            />
          </div>
          <button onClick={handleAddTask}>Add</button>
        </div>

        <div className='input-subtask'>
          {subtaskInputs.map((subtask, index) => (
            <input
              key={index}
              type='text'
              value={subtask}
              onChange={e => handleSubtaskInputChange(index, e.target.value)}
              placeholder='Enter subtask'
            />
          ))}
        </div>
      </div>

      <h2>Tasks - {activeTasks.length}</h2>
      <div className='active-task-card'>
        {activeTasks.map((task, index) => (
          <div
            key={index}
            className=''
            draggable='true'
            onDragStart={() => handleDragStart(index)}
            onDragOver={() => handleDragOver(index)}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDrop(index)}
          >
            <div className='active-task'>
              <li className='active-task-input'>
                <label className='custom-checkbox'>
                  <input
                    type='checkbox'
                    checked={task.completed}
                    onChange={() => handleToggleComplete(tasks.indexOf(task))}
                    className='task-checkbox'
                  />
                  <span className='checkmark'></span>
                </label>

                <div className='active-task-details'>
                  {isEditing && editIndex === index ? (
                    <input
                      type='text'
                      value={editTaskInput}
                      onChange={e => setEditTaskInput(e.target.value)}
                    />
                  ) : (
                    <span>{task.task}</span>
                  )}
                  {task.subtasks.length > 0 ? (
                    <small className='active-task-details-date'>
                      <span>
                        <PiGitBranchLight size={16} />
                        {
                          task.subtasks.filter(subtask => subtask.completed)
                            .length
                        }
                        /{task.subtasks.length}
                      </span>

                      <span>
                        <CiCalendarDate size={16} />
                        {task.createdDay}
                      </span>
                    </small>
                  ) : (
                    <small className='active-task-details-date'>
                      <span>
                        <CiCalendarDate size={16} />
                        {task.createdDay}
                      </span>
                    </small>
                  )}
                </div>
              </li>

              <div className='active-task-action'>
                <div className='active-task-action-button'>
                  <button onClick={() => handleEditTask(tasks.indexOf(task))}>
                    <FaPencil className='pencil' />
                  </button>
                  {isEditing && editIndex === index && (
                    <button onClick={handleSaveEditedTask}>Save</button>
                  )}
                  <button onClick={() => handleRemoveTask(tasks.indexOf(task))}>
                    <FaTrash className='trash' />
                  </button>
                </div>
                {task.subtasks.length > 0 && (
                  <button
                    className='chevron'
                    onClick={() => setShowTaskDetails(!showTaskDetails)}
                  >
                    {showTaskDetails ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                )}
              </div>
            </div>

            {task.subtasks.length > 0 && showTaskDetails && (
              <ul className='active-task-subtask'>
                {task.subtasks.map((subtask, subIndex) => (
                  <li
                    key={subIndex}
                    style={{
                      textDecoration: subtask.completed
                        ? "line-through"
                        : "none",
                    }}
                  >
                    <div className='active-task-input'>
                      <label className='custom-checkbox'>
                        <input
                          type='checkbox'
                          checked={subtask.completed}
                          onChange={() =>
                            handleToggleSubtaskComplete(
                              tasks.indexOf(task),
                              subIndex
                            )
                          }
                          className='task-checkbox'
                        />
                        <span className='checkmark-subtask'></span>
                      </label>
                      {isEditing && editIndex === index ? (
                        <input
                          type='text'
                          value={editSubtaskInputs[subIndex] || ""}
                          onChange={e =>
                            handleEditSubtaskInputChange(
                              subIndex,
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        subtask.text
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      <h2>Completed Tasks ({completedTasks.length})</h2>
      <div className=''>
        {completedTasks.map((task, index) => (
          <div key={index}>
            <li
              className='completed-task'
              style={{
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              <div className='completed-task-input'>
                <label className='custom-checkbox'>
                  <input
                    type='checkbox'
                    checked={task.completed}
                    onChange={() => handleToggleComplete(tasks.indexOf(task))}
                    className='task-checkbox'
                  />
                  <span className='checkmark'></span>
                </label>

                <div className='completed-task-details'>
                  <span>{task.task}</span>
                  <small className='active-task-details-date'>
                    <span>
                      <CiCalendarDate size={16} />
                      {task.createdDay}
                    </span>
                  </small>
                </div>
              </div>

              <div className='completed-subtask-action'>
                <div className='active-taskaction-button'>
                  <button onClick={() => handleRemoveTask(tasks.indexOf(task))}>
                    <FaTrash className='trash' />
                  </button>
                </div>
                {task.subtasks.length > 0 && (
                  <button
                    className='chevron'
                    onClick={() => setShowTaskDetails(!showTaskDetails)}
                  >
                    {showTaskDetails ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                )}
              </div>
            </li>

            {task.subtasks.length > 0 && showTaskDetails && (
              <ul className='active-task-subtask'>
                {task.subtasks.map((subtask, subIndex) => (
                  <li
                    key={subIndex}
                    style={{
                      textDecoration: "line-through",
                    }}
                  >
                    <div className='active-task-input'>
                      <label className='custom-checkbox'>
                        <input
                          type='checkbox'
                          checked={subtask.completed}
                          onChange={() =>
                            handleToggleSubtaskComplete(index, subIndex)
                          }
                          className='task-checkbox'
                        />
                        <span className='checkmark-subtask'></span>
                      </label>
                      {subtask.text}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;
