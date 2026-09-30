import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";
import socket from "../socket";

const ProjectDetails = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ახალი თასქის ფორმის სტეიტები
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  // message states
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");

  const [memberEmail, setMemberEmail] = useState('');

  // თასქების წამოღება
  const fetchTasks = async () => {
    try {
      const response = await api.get(`/tasks/${projectId}`);
      setTasks(response.data);
    } catch (err) {
      console.error("Failed to fetch tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  useEffect(() => {
    socket.connect();

    socket.emit('join_project', projectId);

    socket.on("receive_message", (data) => {
      console.log("📥 მესიჯი მოვიდა სერვერიდან:", data);
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off("receive_message");
      socket.disconnect();
    };
  }, [projectId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const messageData = {
      text: inputMessage,
      sender: "You", // მოგვიანებით იუზერის სახელს დავსვამთ
      projectId: projectId,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // ვაგზავნით მესიჯს სერვერზე რეალურ დროში
    socket.emit("send_message", messageData);

    // ვამატებთ ჩვენს ეკრანზეც მომენტალურად
    setMessages((prev) => [...prev, messageData]);
    setInputMessage("");
  };

  // ახალი თასქის შექმნის ფუნქცია
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    try {
      const res = await api.post("/tasks/create-task", {
        title: taskTitle,
        description: taskDesc,
        project: projectId, // ვაყოლებთ პროექტის ID-ს
      });
      alert("Task created successfully!");

      // მომენტალურად ვამატებთ ახალ თასქს სიაში
      setTasks([...tasks, res.data.task]);
      setTaskTitle("");
      setTaskDesc("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create task");
    }
  };

  // დამხმარე ფუნქცია taskების სტატუსის მიხედვით გასაფილტრად
  const filterTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim()) return;

    try {
        const res = await api.post(`/projects/${projectId}/add-member`, { email: memberEmail });
        alert(res.data.message);
        setMemberEmail('');
    } catch (err) {
        alert(err.response?.data?.message || 'Failed to add member');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">Loading project board...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
          <div>
            <h1 className="text-3xl font-bold text-emerald-400">
              📋 Project Board
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage your team tasks in real-time.
            </p>
          </div>
          <Link
            to="/dashboard"
            className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold px-4 py-2 rounded-xl transition duration-200 text-sm"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl mb-8">
          <h2 className="text-lg font-bold text-slate-200 mb-4">
            Add New Task
          </h2>
          <form
            onSubmit={handleCreateTask}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <div>
              <label className="block text-slate-400 text-xs mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g., Fix Auth Bug"
                className="w-full text-white bg-slate-900 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-slate-400 text-xs mb-1">
                Description
              </label>
              <input
                type="text"
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Task details..."
                className="w-full text-white bg-slate-900 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 text-sm"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold p-3 rounded-xl transition duration-200 text-sm"
            >
              Add Task
            </button>
          </form>
        </div>

     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl mb-8">
       <h2 className="text-lg font-bold text-slate-200 mb-4">👥 Add Team Member</h2>
       <form onSubmit={handleAddMember} className="flex gap-4 items-end">
         <div className="flex-1">
           <label className="block text-slate-400 text-xs mb-1">User Email Address</label>
           <input 
             type="email" 
             value={memberEmail}
             onChange={(e) => setMemberEmail(e.target.value)}
             placeholder="friend@sentinel.com"
             className="w-full text-white bg-slate-900 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 text-sm"
             required
           />
         </div>
         <button 
           type="submit"
           className="bg-blue-600 hover:bg-blue-700 text-white font-bold p-3 px-6 rounded-xl transition duration-200 text-sm"
         >
           Invite Member
         </button>
       </form>
     </div>

       
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 shadow-lg min-h-125">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/50">
              <h3 className="font-bold text-slate-300 flex items-center gap-2">
                 To Do
              </h3>
              <span className="bg-slate-900 text-slate-400 text-xs px-2 py-0.5 rounded-full">
                {filterTasksByStatus("todo").length}
              </span>
            </div>
            <div className="space-y-3">
              {filterTasksByStatus("todo").map((task) => (
                <div
                  key={task._id}
                  className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow hover:border-slate-600 transition"
                >
                  <h4 className="font-semibold text-slate-200 text-sm mb-1">
                    {task.title}
                  </h4>
                  <p className="text-slate-400 text-xs line-clamp-2">
                    {task.description || "No description"}
                  </p>
                </div>
              ))}
            </div>
          </div>

         
          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 shadow-lg min-h-125">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/50">
              <h3 className="font-bold text-amber-400 flex items-center gap-2">
                In Progress
              </h3>
              <span className="bg-slate-900 text-amber-400/30 text-amber-400 text-xs px-2 py-0.5 rounded-full">
                {filterTasksByStatus("in-progress").length}
              </span>
            </div>
            <div className="space-y-3">
              {filterTasksByStatus("in-progress").map((task) => (
                <div
                  key={task._id}
                  className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow p-4 hover:border-slate-600 transition"
                >
                  <h4 className="font-semibold text-slate-200 text-sm mb-1">
                    {task.title}
                  </h4>
                  <p className="text-slate-400 text-xs line-clamp-2">
                    {task.description || "No description"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700 shadow-lg min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700/50">
              <h3 className="font-bold text-emerald-400 flex items-center gap-2">
                Done
              </h3>
              <span className="bg-slate-900 text-emerald-400 text-xs px-2 py-0.5 rounded-full">
                {filterTasksByStatus("done").length}
              </span>
            </div>
            <div className="space-y-3">
              {filterTasksByStatus("done").map((task) => (
                <div
                  key={task._id}
                  className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow p-4 hover:border-slate-600 transition"
                >
                  <h4 className="font-semibold text-slate-200 text-sm mb-1">
                    {task.title}
                  </h4>
                  <p className="text-slate-400 text-xs line-clamp-2">
                    {task.description || "No description"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
     
     <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl mt-8">
       <h2 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">💬 Project Live Chat</h2>

       
       <div className="bg-slate-900 p-4 rounded-xl h-60 overflow-y-auto mb-4 border border-slate-700/50 space-y-2">
         {messages.length === 0 ? (
           <p className="text-slate-500 text-sm text-center pt-24">No messages yet. Start the conversation!</p>
         ) : (
           messages.map((msg, index) => (
             <div key={index} className={`p-3 rounded-xl max-w-xs text-sm ${msg.sender === 'You' ? 'bg-emerald-500/20 text-emerald-300 ml-auto' : 'bg-slate-800 text-slate-200'}`}>
               <div className="flex justify-between items-center mb-1 text-xs opacity-60">
                 <span className="font-semibold">{msg.sender}</span>
                 <span>{msg.time}</span>
               </div>
               <p>{msg.text}</p>
             </div>
           ))
         )}
       </div>


       <form onSubmit={handleSendMessage} className="flex gap-3">
         <input 
           type="text" 
           value={inputMessage}
           onChange={(e) => setInputMessage(e.target.value)}
           placeholder="Type your secure message..."
           className="flex-1 text-white bg-slate-900 p-3 rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 text-sm"
           required
         />
         <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 rounded-xl transition duration-200 text-sm">
           Send
         </button>
       </form>
     </div>

    </div>
  );
};

export default ProjectDetails;
