export default function Filters({ users, filters, setFilters, handleAddTask }) {
    return (
      <div className="flex border-b border-[#E0E0E0] py-4 px-6 bg-white">
        <div className="flex-grow flex gap-4">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="pl-8 pr-4 py-2 rounded border border-[#E0E0E0] w-64 focus:outline-none focus:border-[#FFCA28]"
            />
            <svg className="w-4 h-4 absolute left-2.5 top-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
  
          <div className="flex gap-2 items-center">
            <select 
              value={filters.user} 
              onChange={(e) => setFilters({ ...filters, user: e.target.value })}
              className="p-2 border border-[#E0E0E0] rounded text-sm focus:outline-none focus:border-[#FFCA28]"
            >
              <option value="">All Users</option>
              {users.map(user => (
                <option key={user} value={user}>{user.split('@')[0]}</option>
              ))}
            </select>
  
            <select 
              value={filters.priority} 
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="p-2 border border-[#E0E0E0] rounded text-sm focus:outline-none focus:border-[#FFCA28]"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
  
            {(filters.user || filters.priority) && (
              <button 
                onClick={() => setFilters({ user: "", priority: "" })}
                className="text-sm text-[#212121] hover:underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
  
        <button
          onClick={handleAddTask}
          className="px-4 cursor-pointer py-2 bg-[#FFCA28] text-[#212121] rounded hover:bg-yellow-400 transition-colors flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Task
        </button>
      </div>
    );
  }
  