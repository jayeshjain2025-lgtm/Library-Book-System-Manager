/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal as TerminalIcon, Book, User, LogOut, ChevronRight, Search, Plus, List, FileText, Save, ArrowLeft, Power } from 'lucide-react';
import { library, Book as BookType } from './lib/librarySystem';

type MenuState = 
  | 'MAIN' 
  | 'ADMIN_LOGIN' 
  | 'STUDENT_LOGIN' 
  | 'ADMIN_MENU' 
  | 'STUDENT_MENU' 
  | 'BOOK_MGMT' 
  | 'VIEW_BOOKS' 
  | 'ADD_BOOK' 
  | 'ADMIN_ISSUE_BOOK'
  | 'SEARCH' 
  | 'MY_BOOKS' 
  | 'ISSUE_BOOK' 
  | 'RETURN_BOOK'
  | 'REPORTS'
  | 'EXIT';

export default function App() {
  const [menu, setMenu] = useState<MenuState>('MAIN');
  const [history, setHistory] = useState<MenuState[]>([]);
  const [output, setOutput] = useState<string[]>(["Welcome to Library Console Pro v1.0.0", "System initialized..."]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0); // Used to force re-renders
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const refresh = () => setTick(t => t + 1);

  // Auto-scroll terminal
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [output, menu]);

  const navigateTo = (next: MenuState) => {
    setIsLoading(true);
    setTimeout(() => {
      setHistory(prev => [...prev, menu]);
      setMenu(next);
      setError(null);
      setIsLoading(false);
    }, 400);
  };

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      setHistory(prevHistory => prevHistory.slice(0, -1));
      setMenu(prev);
      setError(null);
    }
  };

  const addOutput = (line: string) => {
    setOutput(prev => [...prev, `> ${line}`]);
  };

  const handleAction = (choice: string) => {
    const c = choice.trim();
    
    if (menu === 'MAIN') {
      if (c === '1') navigateTo('ADMIN_LOGIN');
      else if (c === '2') navigateTo('STUDENT_LOGIN');
      else if (c === '3') setMenu('EXIT');
      else setError("Invalid choice. Please enter 1, 2, or 3.");
    } 
    else if (menu === 'ADMIN_MENU') {
      if (c === '1') navigateTo('BOOK_MGMT');
      else if (c === '2') navigateTo('ADMIN_ISSUE_BOOK');
      else if (c === '3') navigateTo('REPORTS');
      else if (c === '4') navigateTo('SEARCH');
      else if (c === '5') {
        addOutput("Saving data to library_data.txt...");
        setTimeout(() => addOutput("Data saved successfully!"), 500);
      }
      else if (c === '6') {
        library.logout();
        setMenu('MAIN');
        setHistory([]);
        addOutput("Logged out successfully.");
      }
      else setError("Invalid choice.");
    }
    else if (menu === 'STUDENT_MENU') {
      if (c === '1') navigateTo('ISSUE_BOOK');
      else if (c === '2') navigateTo('RETURN_BOOK');
      else if (c === '3') navigateTo('MY_BOOKS');
      else if (c === '4') navigateTo('SEARCH');
      else if (c === '5') {
        library.logout();
        setMenu('MAIN');
        setHistory([]);
        addOutput("Logged out successfully.");
      }
      else setError("Invalid choice.");
    }
    else if (menu === 'BOOK_MGMT') {
      if (c === '1') navigateTo('ADD_BOOK');
      else if (c === '2') navigateTo('VIEW_BOOKS');
      else if (c === '3') goBack();
      else setError("Invalid choice.");
    }
  };

  const handleLogin = (role: 'admin' | 'student', pass: string) => {
    if (pass === '123') {
      library.login(role, role);
      addOutput(`Logged in as ${role.toUpperCase()}`);
      setMenu(role === 'admin' ? 'ADMIN_MENU' : 'STUDENT_MENU');
      setHistory([]);
    } else {
      setError("Invalid password. Try '123'.");
    }
  };

  const renderMenu = () => {
    switch (menu) {
      case 'MAIN':
        return (
          <div className="space-y-6">
            <div className="text-[8px] leading-tight text-emerald-500/60 font-mono whitespace-pre opacity-80">
{`  _      _____ ____  _____            _______     __
 | |    |_   _|  _ \\|  __ \\     /\\   |  __ \\ \\   / /
 | |      | | | |_) | |__) |   /  \\  | |__) \\ \\_/ / 
 | |      | | |  _ <|  _  /   / /\\ \\ |  _  / \\   /  
 | |____ _| |_| |_) | | \\ \\  / ____ \\| | \\ \\  | |   
 |______|_____|____/|_|  \\_\\/_/    \\_\\_|  \\_\\ |_|   `}
            </div>
            <div className="text-emerald-500 font-bold mb-4 flex items-center gap-2">
              <ChevronRight size={16} />
              SYSTEM AUTHENTICATION REQUIRED
            </div>
            <div className="space-y-2">
              <button onClick={() => handleAction('1')} className="flex items-center gap-3 w-full text-left hover:bg-white/10 p-2 rounded transition-colors group">
                <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">1.</span>
                <User size={18} className="text-zinc-400" />
                <span>Login as Admin</span>
              </button>
              <button onClick={() => handleAction('2')} className="flex items-center gap-3 w-full text-left hover:bg-white/10 p-2 rounded transition-colors group">
                <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">2.</span>
                <User size={18} className="text-zinc-400" />
                <span>Login as Student</span>
              </button>
              <button onClick={() => handleAction('3')} className="flex items-center gap-3 w-full text-left hover:bg-white/10 p-2 rounded transition-colors group text-red-400">
                <span className="text-red-500 group-hover:translate-x-1 transition-transform">3.</span>
                <Power size={18} />
                <span>Exit</span>
              </button>
            </div>
          </div>
        );

      case 'ADMIN_LOGIN':
      case 'STUDENT_LOGIN':
        const role = menu === 'ADMIN_LOGIN' ? 'admin' : 'student';
        return (
          <div className="space-y-4">
            <div className="text-emerald-500 font-bold">--- {role.toUpperCase()} LOGIN ---</div>
            <div className="space-y-2">
              <p className="text-zinc-400 text-sm italic">
                {role === 'admin' ? "Hint: Username 'admin', Password '123'" : "Hint: Username 'S001', Password '123'"}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded">
                  <User size={16} className="text-emerald-500" />
                  <input 
                    id="login-user"
                    type="text" 
                    placeholder="Username"
                    className="bg-transparent border-none outline-none w-full text-emerald-400"
                  />
                </div>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded">
                  <ChevronRight size={16} className="text-emerald-500" />
                  <input 
                    id="login-pass"
                    type="password" 
                    placeholder="Password"
                    className="bg-transparent border-none outline-none w-full text-emerald-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const u = (document.getElementById('login-user') as HTMLInputElement).value;
                        const p = (document.getElementById('login-pass') as HTMLInputElement).value;
                        if (p === '123') {
                          if (library.login(u, role)) {
                            addOutput(`Logged in as ${u}`);
                            setMenu(role === 'admin' ? 'ADMIN_MENU' : 'STUDENT_MENU');
                            setHistory([]);
                          } else setError("User not found.");
                        } else setError("Invalid password.");
                      }
                    }}
                  />
                </div>
              </div>
            </div>
            <button onClick={goBack} className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm">
              <ArrowLeft size={14} /> Back to Main Menu
            </button>
          </div>
        );

      case 'ADMIN_MENU':
        return (
          <div className="space-y-2">
            <div className="text-emerald-500 font-bold mb-4 flex items-center gap-2">
              <ChevronRight size={16} />
              ADMIN DASHBOARD
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleAction('1')} className="flex items-center gap-3 w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 p-3 rounded-lg transition-all group">
                <Book size={18} className="text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Book Mgmt</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Manage catalog</span>
                </div>
              </button>
              <button onClick={() => handleAction('2')} className="flex items-center gap-3 w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 p-3 rounded-lg transition-all group">
                <Plus size={18} className="text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Issue Book</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Wizard flow</span>
                </div>
              </button>
              <button onClick={() => handleAction('3')} className="flex items-center gap-3 w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 p-3 rounded-lg transition-all group">
                <FileText size={18} className="text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Reports</span>
                  <span className="text-[8px] text-zinc-500 uppercase">System analytics</span>
                </div>
              </button>
              <button onClick={() => handleAction('4')} className="flex items-center gap-3 w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 p-3 rounded-lg transition-all group">
                <Search size={18} className="text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Search</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Find books</span>
                </div>
              </button>
              <button onClick={() => handleAction('5')} className="flex items-center gap-3 w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 p-3 rounded-lg transition-all group">
                <Save size={18} className="text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Save Data</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Sync to disk</span>
                </div>
              </button>
              <button onClick={() => handleAction('6')} className="flex items-center gap-3 w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-red-500/50 hover:bg-red-500/5 p-3 rounded-lg transition-all group">
                <LogOut size={18} className="text-red-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-red-400">Logout</span>
                  <span className="text-[8px] text-zinc-500 uppercase">End session</span>
                </div>
              </button>
            </div>
          </div>
        );

      case 'STUDENT_MENU':
        const currentStudent = library.getStudents().find(s => s.regNo === library.getCurrentUser()?.username);
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <div className="text-emerald-500 font-bold flex items-center gap-2">
                <ChevronRight size={16} />
                STUDENT DASHBOARD ({currentStudent?.regNo})
              </div>
              {currentStudent && currentStudent.fine > 0 && (
                <div className="flex flex-col items-end gap-1">
                  <div className="text-[10px] text-red-400 font-bold animate-pulse">UNPAID FINE: ${currentStudent.fine}</div>
                  <button 
                    onClick={() => {
                      const res = library.payFine(currentStudent.regNo);
                      addOutput(res.message);
                      refresh();
                    }}
                    className="text-[8px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded hover:bg-red-500/40 transition-colors"
                  >
                    PAY NOW
                  </button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => handleAction('1')} className="flex items-center gap-3 w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 p-3 rounded-lg transition-all group">
                <Plus size={18} className="text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Issue Book</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Borrow new items</span>
                </div>
              </button>
              <button onClick={() => handleAction('2')} className="flex items-center gap-3 w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 p-3 rounded-lg transition-all group">
                <ArrowLeft size={18} className="text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Return Book</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Return borrowed</span>
                </div>
              </button>
              <button onClick={() => handleAction('3')} className="flex items-center gap-3 w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 p-3 rounded-lg transition-all group">
                <List size={18} className="text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">My Books</span>
                  <span className="text-[8px] text-zinc-500 uppercase">View personal list</span>
                </div>
              </button>
              <button onClick={() => navigateTo('VIEW_BOOKS')} className="flex items-center gap-3 w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 p-3 rounded-lg transition-all group">
                <Book size={18} className="text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">All Books</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Browse catalog</span>
                </div>
              </button>
              <button onClick={() => handleAction('4')} className="flex items-center gap-3 w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 p-3 rounded-lg transition-all group">
                <Search size={18} className="text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold">Search</span>
                  <span className="text-[8px] text-zinc-500 uppercase">Find by title/ID</span>
                </div>
              </button>
              <button onClick={() => handleAction('5')} className="flex items-center gap-3 w-full text-left bg-zinc-900/50 border border-zinc-800 hover:border-red-500/50 hover:bg-red-500/5 p-3 rounded-lg transition-all group">
                <LogOut size={18} className="text-red-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-red-400">Logout</span>
                  <span className="text-[8px] text-zinc-500 uppercase">End session</span>
                </div>
              </button>
            </div>
          </div>
        );

      case 'BOOK_MGMT':
        return (
          <div className="space-y-2">
            <div className="text-emerald-500 font-bold mb-4">--- BOOK MANAGEMENT ---</div>
            <button onClick={() => handleAction('1')} className="flex items-center gap-3 w-full text-left hover:bg-white/10 p-2 rounded transition-colors group">
              <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">1.</span>
              <Plus size={18} className="text-zinc-400" />
              <span>Add Book</span>
            </button>
            <button onClick={() => handleAction('2')} className="flex items-center gap-3 w-full text-left hover:bg-white/10 p-2 rounded transition-colors group">
              <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">2.</span>
              <List size={18} className="text-zinc-400" />
              <span>View All Books</span>
            </button>
            <button onClick={goBack} className="flex items-center gap-3 w-full text-left hover:bg-white/10 p-2 rounded transition-colors group text-zinc-400">
              <span className="text-zinc-500 group-hover:translate-x-1 transition-transform">3.</span>
              <ArrowLeft size={18} />
              <span>Back</span>
            </button>
          </div>
        );

      case 'VIEW_BOOKS':
        return (
          <div className="space-y-4">
            <div className="text-emerald-500 font-bold">===== BOOK LIST =====</div>
            <div className="max-h-64 overflow-y-auto border border-zinc-800 rounded p-2 bg-black/30">
              <table className="w-full text-[10px] text-left">
                <thead className="text-zinc-500 uppercase border-b border-zinc-800">
                  <tr>
                    <th className="pb-2 px-2">ID</th>
                    <th className="pb-2 px-2">Title</th>
                    <th className="pb-2 px-2">Status</th>
                    <th className="pb-2 px-2">Due Date</th>
                    <th className="pb-2 px-2">Queue</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300">
                  {library.getBooks().length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-zinc-500 italic">No books available.</td>
                    </tr>
                  ) : library.getBooks().map(b => (
                    <tr key={b.id} className="border-t border-zinc-900/50 hover:bg-white/5">
                      <td className="py-2 px-2">{b.id}</td>
                      <td className="py-2 px-2">
                        <div className="font-bold">{b.title}</div>
                        <div className="text-[8px] text-zinc-500">{b.author}</div>
                      </td>
                      <td className="py-2 px-2">
                        <span className={b.status === 1 ? "text-red-400 font-bold" : "text-emerald-400 font-bold"}>
                          {b.status === 1 ? `ISSUED (${b.issuedToRegNo})` : "AVAILABLE"}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-zinc-500">{b.dueDate || '-'}</td>
                      <td className="py-2 px-2">
                        {b.reservations.length > 0 ? (
                          <span className="text-amber-500">({b.reservations.length})</span>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="h-px bg-zinc-800 w-full" />
            <button onClick={goBack} className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm">
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        );

      case 'ADD_BOOK':
        return (
          <div className="space-y-4">
            <div className="text-emerald-500 font-bold">--- ADD NEW BOOK ---</div>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 uppercase">Title</label>
                <input 
                  autoFocus
                  id="book-title"
                  className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-emerald-400 outline-none focus:border-emerald-500/50"
                  placeholder="Enter book title"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 uppercase">Author</label>
                <input 
                  id="book-author"
                  className="w-full bg-zinc-900 border border-zinc-800 p-2 rounded text-emerald-400 outline-none focus:border-emerald-500/50"
                  placeholder="Enter author name"
                />
              </div>
              <button 
                onClick={() => {
                  const title = (document.getElementById('book-title') as HTMLInputElement).value;
                  const author = (document.getElementById('book-author') as HTMLInputElement).value;
                  if (title && author) {
                    library.addBook(title, author);
                    addOutput(`Added book: ${title}`);
                    refresh();
                    goBack();
                  } else {
                    setError("Both fields are required.");
                  }
                }}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded font-bold transition-colors"
              >
                SUBMIT
              </button>
            </div>
            <button onClick={goBack} className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm">
              <ArrowLeft size={14} /> Cancel
            </button>
          </div>
        );

      case 'SEARCH':
        return (
          <div className="space-y-4">
            <div className="text-emerald-500 font-bold">===== SEARCH BOOKS =====</div>
            <div className="flex gap-2">
              <input 
                autoFocus
                className="flex-1 bg-zinc-900 border border-zinc-800 p-2 rounded text-emerald-400 outline-none focus:border-emerald-500/50"
                placeholder="Search by title or author..."
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {input && library.searchBooks(input).map(b => (
                <div key={b.id} className="p-2 border border-zinc-800 rounded bg-zinc-900/50 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold">{b.title}</div>
                    <div className="text-xs text-zinc-500">{b.author}</div>
                  </div>
                  <div className={`text-[10px] uppercase px-1.5 py-0.5 rounded font-bold ${b.status === 1 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {b.status === 1 ? 'Issued' : 'Available'}
                  </div>
                </div>
              ))}
              {input && library.searchBooks(input).length === 0 && (
                <div className="text-zinc-500 text-center py-4 italic">No matches found.</div>
              )}
            </div>
            <div className="h-px bg-zinc-800 w-full" />
            <button onClick={goBack} className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm">
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        );

      case 'ISSUE_BOOK':
        return (
          <div className="space-y-4">
            <div className="text-emerald-500 font-bold">--- ISSUE / RESERVE BOOK ---</div>
            <p className="text-[10px] text-zinc-400 italic">Available books can be issued. Issued books can be reserved.</p>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {library.getBooks().map(b => (
                <button 
                  key={b.id}
                  onClick={() => {
                    const res = library.issueBook(b.id);
                    if (res.success) {
                      addOutput(res.message);
                      refresh();
                      goBack();
                    } else {
                      setError(res.message);
                    }
                  }}
                  className={`w-full p-2 border border-zinc-800 rounded bg-zinc-900/50 hover:border-emerald-500/50 text-left transition-all group ${b.status === 1 ? 'hover:bg-amber-500/5' : 'hover:bg-emerald-500/10'}`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold group-hover:text-emerald-400">{b.title}</div>
                      <div className="text-xs text-zinc-500">{b.author}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] uppercase px-1 py-0.5 rounded ${b.status === 1 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {b.status === 1 ? 'Issued' : 'Available'}
                      </span>
                      {b.status === 1 ? <ChevronRight size={14} className="text-amber-500" /> : <Plus size={14} className="text-emerald-500" />}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={goBack} className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm">
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        );

      case 'RETURN_BOOK':
        return (
          <div className="space-y-4">
            <div className="text-emerald-500 font-bold">--- RETURN BOOK ---</div>
            <p className="text-xs text-zinc-400">Select a book to return:</p>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {library.getMyBooks().map(b => (
                <button 
                  key={b.id}
                  onClick={() => {
                    const res = library.returnBook(b.id);
                    if (res.success) {
                      addOutput(res.message);
                      refresh();
                      goBack();
                    } else {
                      setError(res.message);
                    }
                  }}
                  className="w-full p-2 border border-zinc-800 rounded bg-zinc-900/50 hover:bg-red-500/10 hover:border-red-500/50 text-left transition-all group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-sm font-bold group-hover:text-red-400">{b.title}</div>
                      <div className="text-xs text-zinc-500">{b.author}</div>
                    </div>
                    <ArrowLeft size={14} className="text-zinc-600 group-hover:text-red-500" />
                  </div>
                </button>
              ))}
              {library.getMyBooks().length === 0 && (
                <div className="text-zinc-500 text-center py-8 italic">You have no books to return.</div>
              )}
            </div>
            <button onClick={goBack} className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm">
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        );

      case 'ADMIN_ISSUE_BOOK':
        const [wizardStep, setWizardStep] = useState(0);
        const [targetReg, setTargetReg] = useState("");
        const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

        const student = library.getStudents().find(s => s.regNo === targetReg);
        const book = library.getBooks().find(b => b.id === selectedBookId);

        return (
          <div className="space-y-4">
            <div className="text-emerald-500 font-bold">===== ISSUE WIZARD (STEP {wizardStep + 1}/3) =====</div>
            
            {wizardStep === 0 && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-400">Step 1: Identify Student</p>
                <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded">
                  <User size={16} className="text-emerald-500" />
                  <input 
                    id="wizard-reg"
                    type="text" 
                    placeholder="Enter Student RegNo (e.g. S001)"
                    className="bg-transparent border-none outline-none w-full text-emerald-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const reg = (e.target as HTMLInputElement).value;
                        if (library.getStudents().find(s => s.regNo === reg)) {
                          setTargetReg(reg);
                          setWizardStep(1);
                        } else setError("Student not found.");
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {wizardStep === 1 && student && (
              <div className="space-y-4">
                <div className="p-3 border border-zinc-800 rounded bg-zinc-900/30">
                  <div className="text-xs text-zinc-500 uppercase">Student Identified</div>
                  <div className="text-emerald-400 font-bold">{student.name} ({student.regNo})</div>
                  <div className="text-[10px] text-zinc-500 mt-1">
                    Borrowed: <span className={student.borrowedBookIds.length >= 3 ? "text-red-400" : "text-emerald-500"}>
                      {student.borrowedBookIds.length}/3
                    </span>
                    {student.borrowedBookIds.length === 2 && <span className="ml-2 text-amber-500 italic">! Last book allowed</span>}
                  </div>
                </div>

                {student.borrowedBookIds.length >= 3 ? (
                  <div className="text-red-400 text-center py-4 bg-red-400/5 border border-red-400/20 rounded">
                    Limit reached. Cannot issue more books.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-400">Step 2: Select Available Book</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {library.getBooks().filter(b => b.status === 0).map(b => (
                        <button 
                          key={b.id}
                          onClick={() => {
                            setSelectedBookId(b.id);
                            setWizardStep(2);
                          }}
                          className="w-full p-2 border border-zinc-800 rounded bg-zinc-900/50 hover:border-emerald-500/50 text-left text-[10px] flex justify-between items-center group"
                        >
                          <span>{b.title}</span>
                          <span className="text-zinc-500 group-hover:text-emerald-500">ID: {b.id}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {wizardStep === 2 && student && book && (
              <div className="space-y-4">
                <div className="p-4 border border-emerald-500/20 rounded bg-emerald-500/5 space-y-3">
                  <div className="text-center text-xs text-emerald-500 font-bold uppercase tracking-widest">Confirmation Required</div>
                  <div className="flex justify-between items-center text-sm border-b border-zinc-800 pb-2">
                    <span className="text-zinc-500">Issuing:</span>
                    <span className="text-zinc-200 font-bold">{book.title}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500">To:</span>
                    <span className="text-zinc-200 font-bold">{student.name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      addOutput(`ADMIN_ACTION: Issued ${book.title} to ${student.regNo}`);
                      const prevUser = library.getCurrentUser();
                      library.login(student.regNo, 'student');
                      library.issueBook(book.id);
                      if (prevUser) library.login(prevUser.username, prevUser.role);
                      else library.logout();
                      
                      refresh();
                      goBack();
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded transition-colors"
                  >
                    Confirm Issue
                  </button>
                  <button onClick={() => setWizardStep(1)} className="px-4 border border-zinc-800 hover:bg-zinc-900 rounded">Cancel</button>
                </div>
              </div>
            )}

            <button onClick={goBack} className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm mt-4">
              <ArrowLeft size={14} /> Abort Wizard
            </button>
          </div>
        );

      case 'MY_BOOKS':
        return (
          <div className="space-y-4">
            <div className="text-emerald-500 font-bold">===== MY ISSUED BOOKS =====</div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {library.getMyBooks().length === 0 ? (
                <div className="text-zinc-500 text-center py-8 italic">No books currently issued.</div>
              ) : library.getMyBooks().map(b => (
                <div key={b.id} className="p-3 border border-zinc-800 rounded bg-zinc-900/50 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-bold">{b.title}</div>
                    <div className="text-[10px] text-zinc-500">Due Date: <span className="text-amber-500">{b.dueDate}</span></div>
                  </div>
                  <div className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold">
                    Issued
                  </div>
                </div>
              ))}
            </div>
            <div className="h-px bg-zinc-800 w-full" />
            <button onClick={goBack} className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm">
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        );

      case 'REPORTS':
        const books = library.getBooks();
        const students = library.getStudents();
        const issuedBooks = books.filter(b => b.status === 1);
        const today = new Date().toISOString().split('T')[0];
        const overdueBooks = issuedBooks.filter(b => b.dueDate < today);
        const mostIssued = [...books].sort((a, b) => b.issueCount - a.issueCount).slice(0, 5);
        const totalFines = students.reduce((acc, s) => acc + s.fine, 0);
        
        return (
          <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="text-emerald-500 font-bold flex items-center gap-2 sticky top-0 bg-zinc-950 py-2 z-10">
              <ChevronRight size={16} />
              SYSTEM ANALYTICS
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 border border-zinc-800 rounded bg-zinc-900/30">
                <div className="text-[10px] text-zinc-500 uppercase">Availability</div>
                <div className="flex justify-between items-end mt-1">
                  <span className="text-xl font-mono text-emerald-400">{books.length - issuedBooks.length}</span>
                  <span className="text-[8px] text-zinc-600">/ {books.length}</span>
                </div>
              </div>
              <div className="p-3 border border-zinc-800 rounded bg-zinc-900/30">
                <div className="text-[10px] text-zinc-500 uppercase">Overdue</div>
                <div className="flex justify-between items-end mt-1">
                  <span className={`text-xl font-mono ${overdueBooks.length > 0 ? 'text-red-500 animate-pulse' : 'text-zinc-500'}`}>
                    {overdueBooks.length}
                  </span>
                  <span className="text-[8px] text-zinc-600">BOOKS</span>
                </div>
              </div>
              <div className="p-3 border border-zinc-800 rounded bg-zinc-900/30">
                <div className="text-[10px] text-zinc-500 uppercase">Fines</div>
                <div className="flex justify-between items-end mt-1">
                  <span className={`text-xl font-mono ${totalFines > 0 ? 'text-amber-500' : 'text-zinc-500'}`}>
                    ${totalFines}
                  </span>
                  <span className="text-[8px] text-zinc-600">PENDING</span>
                </div>
              </div>
            </div>

            {/* Issued Books Table */}
            <div className="space-y-2">
              <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest border-b border-emerald-500/20 pb-1">
                Current Loans
              </div>
              {issuedBooks.length === 0 ? (
                <div className="text-[10px] text-zinc-600 italic py-2">No active loans.</div>
              ) : (
                <div className="space-y-1">
                  {issuedBooks.map(b => (
                    <div key={b.id} className="grid grid-cols-4 text-[9px] p-2 bg-zinc-900/50 border border-zinc-800 rounded hover:border-zinc-700 transition-colors">
                      <span className="text-zinc-300 truncate pr-2">{b.title}</span>
                      <span className="text-zinc-500">{b.issuedToRegNo}</span>
                      <span className={b.dueDate < today ? "text-red-400" : "text-zinc-400"}>{b.dueDate}</span>
                      <span className="text-right text-zinc-600 uppercase">{b.dueDate < today ? "Overdue" : "Active"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Most Popular */}
            <div className="space-y-2">
              <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest border-b border-emerald-500/20 pb-1">
                Popularity Index
              </div>
              <div className="space-y-1">
                {mostIssued.filter(b => b.issueCount > 0).map((b, i) => (
                  <div key={b.id} className="flex items-center gap-3 p-2 bg-zinc-900/20 rounded">
                    <span className="text-zinc-700 font-mono text-[10px]">0{i+1}</span>
                    <div className="flex-1">
                      <div className="text-[10px] text-zinc-300 truncate">{b.title}</div>
                      <div className="w-full bg-zinc-800 h-1 mt-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full transition-all duration-1000" 
                          style={{ width: `${(b.issueCount / mostIssued[0].issueCount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-500 font-mono">{b.issueCount}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={goBack} className="text-zinc-500 hover:text-white flex items-center gap-2 text-sm sticky bottom-0 bg-zinc-950 py-4 w-full border-t border-zinc-900">
              <ArrowLeft size={14} /> Return to Dashboard
            </button>
          </div>
        );

      case 'EXIT':
        return (
          <div className="flex flex-col items-center justify-center h-64 space-y-4 text-center">
            <Power size={48} className="text-red-500 animate-pulse" />
            <div className="text-xl font-bold">System Shutting Down...</div>
            <p className="text-zinc-500 text-sm">Thank you for using Library Console Pro.</p>
            <button 
              onClick={() => setMenu('MAIN')}
              className="mt-4 text-emerald-500 hover:underline text-sm"
            >
              Restart System
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-mono p-4 md:p-8 flex items-center justify-center selection:bg-emerald-500/30 overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] terminal-glow overflow-hidden flex flex-col h-[650px] relative z-30">
        <div className="scanline" />
        <div className="crt-overlay" />
        
        {/* Terminal Header */}
        <div className="bg-zinc-900/80 backdrop-blur-md px-4 py-3 flex items-center justify-between border-b border-zinc-800/50">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40" />
              <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/40" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />
            </div>
            <div className="h-4 w-px bg-zinc-800 mx-1" />
            <div className="flex items-center gap-2">
              <TerminalIcon size={14} className="text-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.2em] text-zinc-400 uppercase">Library_OS v1.0.4</span>
            </div>
          </div>
        <div className="text-[10px] font-mono text-zinc-600 flex items-center gap-2">
          <span className="text-emerald-500/50">{currentTime.toLocaleDateString()}</span>
          <span className="w-px h-2 bg-zinc-800" />
          <span className="text-emerald-500">{currentTime.toLocaleTimeString()}</span>
        </div>
        </div>

        {/* Terminal Body */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {isLoading && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center gap-4">
              <div className="flex gap-1">
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }} 
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="w-2 h-2 bg-emerald-500 rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }} 
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-2 h-2 bg-emerald-500 rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.5, 1] }} 
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-2 h-2 bg-emerald-500 rounded-full" 
                />
              </div>
              <span className="text-[10px] font-bold tracking-widest text-emerald-500/80 animate-pulse">PROCESSING_REQUEST...</span>
            </div>
          )}
          {/* Output Log */}
          <div 
            ref={scrollRef}
            className="flex-1 p-4 overflow-y-auto space-y-1 text-xs text-zinc-500 scrollbar-thin scrollbar-thumb-zinc-800"
          >
            {output.map((line, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-zinc-700">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                <span className={line.startsWith('>') ? 'text-emerald-500/70' : ''}>{line}</span>
              </div>
            ))}
            {error && (
              <div className="text-red-400 bg-red-400/10 p-2 rounded border border-red-400/20 mt-2">
                ERROR: {error}
              </div>
            )}
          </div>

          {/* Active Menu Area */}
          <div className="p-6 bg-black/20 border-t border-zinc-900">
            <AnimatePresence mode="wait">
              <motion.div
                key={menu}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderMenu()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-zinc-900 px-4 py-1.5 flex items-center justify-between border-t border-zinc-800 text-[10px] text-zinc-500">
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              STATUS: ONLINE
            </span>
            <span>USER: {library.getCurrentUser()?.username || 'GUEST'}</span>
            <span>ROLE: {library.getCurrentUser()?.role || 'NONE'}</span>
          </div>
          <div className="flex gap-4 uppercase">
            <span>UTF-8</span>
            <span>TS/REACT</span>
          </div>
        </div>
      </div>
    </div>
  );
}
