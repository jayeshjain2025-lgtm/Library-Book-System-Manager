export enum BookStatus {
  AVAILABLE = 0,
  ISSUED = 1
}

export interface Transaction {
  date: string;
  type: 'ISSUE' | 'RETURN' | 'RESERVE';
  studentRegNo: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  status: BookStatus;
  issuedToRegNo: string;
  issueDate: string;
  dueDate: string;
  reservations: string[];
  history: Transaction[];
  issueCount: number;
}

export interface Student {
  regNo: string;
  name: string;
  borrowedBookIds: number[];
  fine: number;
}

export class LibrarySystem {
  private books: Book[] = [
    { id: 101, title: "Effective C++", author: "Scott Meyers", status: BookStatus.ISSUED, issuedToRegNo: "S001", issueDate: "2026-04-01", dueDate: "2026-04-15", reservations: ["S003"], history: [], issueCount: 5 },
    { id: 102, title: "Clean Architecture", author: "Robert Martin", status: BookStatus.ISSUED, issuedToRegNo: "S001", issueDate: "2026-04-01", dueDate: "2026-04-15", reservations: [], history: [], issueCount: 12 },
    { id: 103, title: "Design Patterns", author: "GoF", status: BookStatus.ISSUED, issuedToRegNo: "S001", issueDate: "2026-04-01", dueDate: "2026-04-15", reservations: [], history: [], issueCount: 8 },
    { id: 104, title: "Pragmatic Programmer", author: "Hunt & Thomas", status: BookStatus.ISSUED, issuedToRegNo: "S002", issueDate: "2026-03-01", dueDate: "2026-03-15", reservations: ["S004"], history: [], issueCount: 15 },
    { id: 105, title: "Refactoring", author: "Martin Fowler", status: BookStatus.AVAILABLE, issuedToRegNo: "", issueDate: "", dueDate: "", reservations: ["S005"], history: [], issueCount: 3 },
    { id: 106, title: "Introduction to Algorithms", author: "CLRS", status: BookStatus.AVAILABLE, issuedToRegNo: "", issueDate: "", dueDate: "", reservations: [], history: [], issueCount: 20 },
    { id: 107, title: "Code Complete", author: "Steve McConnell", status: BookStatus.ISSUED, issuedToRegNo: "S004", issueDate: "2026-04-05", dueDate: "2026-04-19", reservations: [], history: [], issueCount: 7 },
    { id: 108, title: "The Mythical Man-Month", author: "Brooks", status: BookStatus.AVAILABLE, issuedToRegNo: "", issueDate: "", dueDate: "", reservations: [], history: [], issueCount: 4 },
    { id: 109, title: "Structure and Interpretation", author: "Abelson", status: BookStatus.AVAILABLE, issuedToRegNo: "", issueDate: "", dueDate: "", reservations: [], history: [], issueCount: 6 },
    { id: 110, title: "You Don't Know JS", author: "Kyle Simpson", status: BookStatus.AVAILABLE, issuedToRegNo: "", issueDate: "", dueDate: "", reservations: [], history: [], issueCount: 25 },
  ];

  private students: Student[] = [
    { regNo: "S001", name: "Alice (Limit)", borrowedBookIds: [101, 102, 103], fine: 0 },
    { regNo: "S002", name: "Bob (Overdue)", borrowedBookIds: [104], fine: 0 },
    { regNo: "S003", name: "Charlie (Fined)", borrowedBookIds: [], fine: 50 },
    { regNo: "S004", name: "David", borrowedBookIds: [107], fine: 0 },
    { regNo: "S005", name: "Eve", borrowedBookIds: [], fine: 0 },
  ];

  private currentUser: { username: string; role: 'admin' | 'student' } | null = null;

  getCurrentUser() {
    return this.currentUser;
  }

  login(username: string, role: 'admin' | 'student'): boolean {
    if (role === 'admin' && username === 'admin') {
      this.currentUser = { username, role };
      return true;
    }
    const student = this.students.find(s => s.regNo === username);
    if (student) {
      this.currentUser = { username: student.regNo, role: 'student' };
      return true;
    }
    return false;
  }

  logout() {
    this.currentUser = null;
  }

  getBooks() {
    return [...this.books];
  }

  getStudents() {
    return [...this.students];
  }

  addBook(title: string, author: string) {
    const newBook: Book = {
      id: Math.max(...this.books.map(b => b.id), 0) + 1,
      title,
      author,
      status: BookStatus.AVAILABLE,
      issuedToRegNo: "",
      issueDate: "",
      dueDate: "",
      reservations: [],
      history: [],
      issueCount: 0
    };
    this.books.push(newBook);
    return newBook;
  }

  searchBooks(query: string) {
    const q = query.toLowerCase();
    return this.books.filter(b => 
      b.title.toLowerCase().includes(q) || 
      b.author.toLowerCase().includes(q) ||
      b.id.toString().includes(q)
    );
  }

  issueBook(bookId: number): { success: boolean; message: string } {
    if (!this.currentUser || this.currentUser.role !== 'student') {
      return { success: false, message: "Only students can issue books." };
    }

    const book = this.books.find(b => b.id === bookId);
    const student = this.students.find(s => s.regNo === this.currentUser?.username);

    if (!book || !student) return { success: false, message: "System error." };
    
    if (student.fine > 0) {
      return { success: false, message: `Unpaid fine: $${student.fine}. Please clear it first.` };
    }

    if (book.status === BookStatus.ISSUED) {
      if (book.issuedToRegNo === student.regNo) {
        return { success: false, message: "You already have this book." };
      }
      if (book.reservations.includes(student.regNo)) {
        return { success: false, message: "You already have a reservation for this book." };
      }
      book.reservations.push(student.regNo);
      return { success: true, message: "Book is issued. Reservation added to queue." };
    }

    if (student.borrowedBookIds.length >= 3) {
      return { success: false, message: "Borrow limit (3) reached." };
    }

    book.status = BookStatus.ISSUED;
    book.issuedToRegNo = student.regNo;
    book.issueDate = new Date().toISOString().split('T')[0];
    book.dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
    book.issueCount++;
    student.borrowedBookIds.push(bookId);
    
    return { success: true, message: `Issued! Due on ${book.dueDate}` };
  }

  returnBook(bookId: number): { success: boolean; message: string } {
    const book = this.books.find(b => b.id === bookId);
    if (!book || book.status === BookStatus.AVAILABLE) return { success: false, message: "Invalid operation." };

    const student = this.students.find(s => s.regNo === book.issuedToRegNo);
    let fineMsg = "";
    
    if (student) {
      student.borrowedBookIds = student.borrowedBookIds.filter(id => id !== bookId);
      
      // Calculate fine
      const today = new Date();
      const due = new Date(book.dueDate);
      if (today > due) {
        const diffDays = Math.ceil((today.getTime() - due.getTime()) / (1000 * 3600 * 24));
        const fine = diffDays * 2; // $2 per day
        student.fine += fine;
        fineMsg = ` (Overdue by ${diffDays} days. Fine: $${fine})`;
      }
    }

    book.status = BookStatus.AVAILABLE;
    book.issuedToRegNo = "";
    book.issueDate = "";
    book.dueDate = "";

    let msg = "Book returned successfully." + fineMsg;
    
    if (book.reservations.length > 0) {
      const nextReg = book.reservations[0];
      const nextStudent = this.students.find(s => s.regNo === nextReg);
      
      if (nextStudent && nextStudent.borrowedBookIds.length < 3 && nextStudent.fine === 0) {
        book.reservations.shift();
        book.status = BookStatus.ISSUED;
        book.issuedToRegNo = nextReg;
        book.issueDate = new Date().toISOString().split('T')[0];
        book.dueDate = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
        book.issueCount++;
        nextStudent.borrowedBookIds.push(bookId);
        msg += ` Automatically issued to next in queue: ${nextReg}. Due: ${book.dueDate}`;
      } else {
        msg += ` Reserved by ${nextReg}. (Auto-issue skipped: limit/fine check failed)`;
      }
    }

    return { success: true, message: msg };
  }

  payFine(studentRegNo: string): { success: boolean; message: string } {
    const student = this.students.find(s => s.regNo === studentRegNo);
    if (!student) return { success: false, message: "Student not found." };
    if (student.fine === 0) return { success: false, message: "No fine to pay." };
    
    const amount = student.fine;
    student.fine = 0;
    return { success: true, message: `Fine of $${amount} cleared successfully.` };
  }

  getMyBooks() {
    if (!this.currentUser) return [];
    return this.books.filter(b => b.issuedToRegNo === this.currentUser?.username);
  }
}

export const library = new LibrarySystem();
