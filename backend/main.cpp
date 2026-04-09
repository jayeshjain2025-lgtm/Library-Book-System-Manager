#include <iostream>
#include <vector>
#include <string>
#include <iomanip>
#include <fstream>
#include <algorithm>
#include <queue>
#include <ctime>

using namespace std;

// --- Enums and Constants ---

enum class BookStatus { AVAILABLE, ISSUED };

const int MAX_BORROW_LIMIT = 3;

// --- Utility Classes ---

class DateHelper {
public:
    static string getCurrentDate() {
        time_t now = time(0);
        tm *ltm = localtime(&now);
        char buffer[11];
        strftime(buffer, sizeof(buffer), "%Y-%m-%d", ltm);
        return string(buffer);
    }

    static string getDueDate(int daysFromNow = 14) {
        time_t now = time(0);
        now += daysFromNow * 24 * 60 * 60;
        tm *ltm = localtime(&now);
        char buffer[11];
        strftime(buffer, sizeof(buffer), "%Y-%m-%d", ltm);
        return string(buffer);
    }
};

// --- Data Models ---

struct Transaction {
    string date;
    string type; // "ISSUE", "RETURN", "RESERVE"
    string studentRegNo;
};

class Book {
private:
    int id;
    string title;
    string author;
    BookStatus status;
    string issuedToRegNo;
    string issueDate;
    string dueDate;
    queue<string> reservations; // FIFO queue of student RegNos
    vector<Transaction> history;
    int issueCount;

public:
    Book(int id, string t, string a) 
        : id(id), title(t), author(a), status(BookStatus::AVAILABLE), 
          issuedToRegNo(""), issueDate(""), dueDate(""), issueCount(0) {}

    // Getters
    int getId() const { return id; }
    string getTitle() const { return title; }
    string getAuthor() const { return author; }
    BookStatus getStatus() const { return status; }
    string getIssuedTo() const { return issuedToRegNo; }
    string getIssueDate() const { return issueDate; }
    string getDueDate() const { return dueDate; }
    int getIssueCount() const { return issueCount; }
    const vector<Transaction>& getHistory() const { return history; }
    bool hasReservations() const { return !reservations.empty(); }
    string getNextInQueue() const { return reservations.empty() ? "" : reservations.front(); }

    // Setters & Actions
    void issue(string regNo) {
        status = BookStatus::ISSUED;
        issuedToRegNo = regNo;
        issueDate = DateHelper::getCurrentDate();
        dueDate = DateHelper::getDueDate();
        issueCount++;
        history.push_back({issueDate, "ISSUE", regNo});
    }

    void returnBook() {
        status = BookStatus::AVAILABLE;
        issuedToRegNo = "";
        issueDate = "";
        dueDate = "";
        history.push_back({DateHelper::getCurrentDate(), "RETURN", ""});
    }

    void reserve(string regNo) {
        reservations.push(regNo);
        history.push_back({DateHelper::getCurrentDate(), "RESERVE", regNo});
    }

    void popReservation() {
        if (!reservations.empty()) reservations.pop();
    }
};

class Student {
private:
    string regNo;
    string name;
    vector<int> borrowedBookIds;
    double fine;

public:
    Student(string reg, string n) : regNo(reg), name(n), fine(0.0) {}

    string getRegNo() const { return regNo; }
    string getName() const { return name; }
    double getFine() const { return fine; }
    const vector<int>& getBorrowedBooks() const { return borrowedBookIds; }

    bool canBorrow() const { return borrowedBookIds.size() < MAX_BORROW_LIMIT && fine == 0; }

    void addBorrowedBook(int id) { borrowedBookIds.push_back(id); }
    
    void removeBorrowedBook(int id) {
        auto it = find(borrowedBookIds.begin(), borrowedBookIds.end(), id);
        if (it != borrowedBookIds.end()) borrowedBookIds.erase(it);
    }

    void addFine(double amount) { fine += amount; }
    void clearFine() { fine = 0; }
};

// --- Display Manager ---

class DisplayManager {
public:
    static void clearScreen() {
#ifdef _WIN32
        system("cls");
#else
        system("clear");
#endif
    }

    static void showBanner() {
        cout << "\033[1;32m";
        cout << "  _      _____ ____  _____            _______     __" << endl;
        cout << " | |    |_   _|  _ \\|  __ \\     /\\   |  __ \\ \\   / /" << endl;
        cout << " | |      | | | |_) | |__) |   /  \\  | |__) \\ \\_/ / " << endl;
        cout << " | |      | | |  _ <|  _  /   / /\\ \\ |  _  / \\   /  " << endl;
        cout << " | |____ _| |_| |_) | | \\ \\  / ____ \\| | \\ \\  | |   " << endl;
        cout << " |______|_____|____/|_|  \\_\\/_/    \\_\\_|  \\_\\ |_|   " << endl;
        cout << "                                                    " << endl;
        cout << "              MANAGEMENT SYSTEM v1.0                " << endl;
        cout << "\033[0m" << endl;
    }

    static void showLoading(string message, int duration = 1) {
        cout << message;
        for (int i = 0; i < 3; ++i) {
            cout << "." << flush;
#ifdef _WIN32
            _sleep(duration * 300);
#else
            struct timespec ts;
            ts.tv_sec = 0;
            ts.tv_nsec = duration * 300000000L;
            nanosleep(&ts, NULL);
#endif
        }
        cout << endl;
    }

    static void showDivider() {
        cout << "\033[1;30m--------------------------------------------------------------------------------\033[0m" << endl;
    }

    static void showHeader(string title) {
        showDivider();
        cout << "\033[1;36m[ " << DateHelper::getCurrentDate() << " ] >>> " << title << " <<<\033[0m" << endl;
        showDivider();
    }

    static void showMessage(string type, string text) {
        if (type == "success") cout << "\033[1;32m[SUCCESS] " << text << "\033[0m" << endl;
        else if (type == "error") cout << "\033[1;31m[ERROR] " << text << "\033[0m" << endl;
        else cout << "[INFO] " << text << endl;
    }

    static void showBooks(const vector<Book>& bookList) {
        showHeader("BOOK LIST");
        cout << left << setw(8) << "ID" << " | " 
             << setw(25) << "Title" << " | " 
             << setw(15) << "Author" << " | " 
             << "Status" << endl;
        showDivider();

        if (bookList.empty()) {
            cout << "No books found." << endl;
            return;
        }

        for (const auto& b : bookList) {
            cout << left << setw(8) << b.getId() << " | " 
                 << setw(25) << b.getTitle() << " | " 
                 << setw(15) << b.getAuthor() << " | ";
            
            if (b.getStatus() == BookStatus::ISSUED) {
                cout << "\033[1;31mIssued (" << b.getIssuedTo() << ")\033[0m" << endl;
            } else {
                cout << "\033[1;32mAvailable\033[0m" << endl;
            }
        }
        showDivider();
    }
};

// --- Library Controller ---

class Library {
private:
    vector<Book> books;
    vector<Student> students;

public:
    // Operations
    void addBook(int id, string title, string author) {
        for (const auto& b : books) {
            if (b.getId() == id) {
                DisplayManager::showMessage("error", "Duplicate BookID!");
                return;
            }
        }
        books.emplace_back(id, title, author);
        DisplayManager::showMessage("success", "Book added successfully.");
    }

    void addStudent(string regNo, string name) {
        students.emplace_back(regNo, name);
    }

    void issueBook(int bookId, string studentRegNo) {
        Book* book = findBook(bookId);
        Student* student = findStudent(studentRegNo);

        if (!book) { DisplayManager::showMessage("error", "Book not found."); return; }
        if (!student) { DisplayManager::showMessage("error", "Student not found."); return; }

        if (book->getStatus() == BookStatus::ISSUED) {
            cout << "Book is already issued. Would you like to reserve it? (y/n): ";
            char choice; cin >> choice;
            if (choice == 'y' || choice == 'Y') {
                book->reserve(studentRegNo);
                DisplayManager::showMessage("success", "Reservation added to queue.");
            }
            return;
        }

        if (!student->canBorrow()) {
            DisplayManager::showMessage("error", "Student has reached borrow limit.");
            return;
        }

        book->issue(studentRegNo);
        student->addBorrowedBook(bookId);
        DisplayManager::showMessage("success", "Book issued successfully. Due: " + book->getDueDate());
    }

    void returnBook(int bookId) {
        Book* book = findBook(bookId);
        if (!book || book->getStatus() == BookStatus::AVAILABLE) {
            DisplayManager::showMessage("error", "Invalid return operation.");
            return;
        }

        Student* student = findStudent(book->getIssuedTo());
        if (student) {
            student->removeBorrowedBook(bookId);
            
            // Calculate Fine
            string today = DateHelper::getCurrentDate();
            if (today > book->getDueDate()) {
                double fineAmount = 10.0; // Flat fine for demo
                student->addFine(fineAmount);
                DisplayManager::showMessage("error", "Book is OVERDUE! Fine of $10.00 added.");
            }
        }

        book->returnBook();
        DisplayManager::showMessage("success", "Book returned successfully.");

        if (book->hasReservations()) {
            string nextReg = book->getNextInQueue();
            Student* nextStudent = findStudent(nextReg);
            
            if (nextStudent && nextStudent->canBorrow()) {
                book->popReservation();
                book->issue(nextReg);
                nextStudent->addBorrowedBook(bookId);
                cout << "[AUTO-ISSUE] Book automatically issued to next in queue: " << nextReg << endl;
                cout << "Due Date: " << book->getDueDate() << endl;
            } else {
                cout << "[NOTIFICATION] Book is reserved by " << nextReg << ". (Note: Auto-issue failed if limit/fine check)" << endl;
            }
        }
    }

    void payFine(string regNo) {
        Student* s = findStudent(regNo);
        if (!s) return;
        if (s->getFine() == 0) {
            DisplayManager::showMessage("info", "No pending fines.");
            return;
        }
        double amount = s->getFine();
        s->clearFine();
        DisplayManager::showMessage("success", "Fine of $" + to_string(amount) + " cleared.");
    }

    void search(string query) {
        vector<Book> results;
        for (const auto& b : books) {
            if (to_string(b.getId()) == query || 
                b.getTitle().find(query) != string::npos || 
                b.getAuthor().find(query) != string::npos) {
                results.push_back(b);
            }
        }
        DisplayManager::showBooks(results);
    }

    // Reports
    void generateReports() {
        DisplayManager::clearScreen();
        DisplayManager::showHeader("SYSTEM REPORTS");
        
        int issuedCount = 0;
        vector<Book> issuedBooks;
        vector<Book> overdueBooks;
        string today = DateHelper::getCurrentDate();

        for (const auto& b : books) {
            if (b.getStatus() == BookStatus::ISSUED) {
                issuedCount++;
                issuedBooks.push_back(b);
                if (b.getDueDate() < today) {
                    overdueBooks.push_back(b);
                }
            }
        }

        // 1. Available vs Issued Count
        cout << "\n[1] AVAILABILITY SUMMARY" << endl;
        cout << "Total Books: " << books.size() << endl;
        cout << "Available:   " << books.size() - issuedCount << endl;
        cout << "Issued:      " << issuedCount << endl;
        
        // 2. Issued Books Report
        cout << "\n[2] ISSUED BOOKS" << endl;
        if (issuedBooks.empty()) {
            cout << "No books currently issued." << endl;
        } else {
            cout << left << setw(5) << "ID" << " | " << setw(20) << "Title" << " | " << setw(10) << "Issued To" << " | " << setw(12) << "Due Date" << endl;
            DisplayManager::showDivider();
            for (const auto& b : issuedBooks) {
                cout << left << setw(5) << b.getId() << " | " 
                     << setw(20) << (b.getTitle().length() > 20 ? b.getTitle().substr(0, 17) + "..." : b.getTitle()) << " | " 
                     << setw(10) << b.getIssuedTo() << " | " 
                     << setw(12) << b.getDueDate() << endl;
            }
        }

        // 3. Overdue Books Report
        cout << "\n[3] OVERDUE BOOKS" << endl;
        if (overdueBooks.empty()) {
            cout << "No overdue books found." << endl;
        } else {
            cout << "\033[1;31m"; // Red for overdue
            cout << left << setw(5) << "ID" << " | " << setw(20) << "Title" << " | " << setw(10) << "Issued To" << " | " << setw(12) << "Due Date" << endl;
            DisplayManager::showDivider();
            for (const auto& b : overdueBooks) {
                cout << left << setw(5) << b.getId() << " | " 
                     << setw(20) << (b.getTitle().length() > 20 ? b.getTitle().substr(0, 17) + "..." : b.getTitle()) << " | " 
                     << setw(10) << b.getIssuedTo() << " | " 
                     << setw(12) << b.getDueDate() << endl;
            }
            cout << "\033[0m";
        }

        // 4. Most Issued Books
        cout << "\n[4] MOST POPULAR BOOKS" << endl;
        vector<Book> sortedBooks = books;
        sort(sortedBooks.begin(), sortedBooks.end(), [](const Book& a, const Book& b) {
            return a.getIssueCount() > b.getIssueCount();
        });
        
        cout << left << setw(25) << "Title" << " | " << setw(10) << "Issues" << endl;
        DisplayManager::showDivider();
        for (int i = 0; i < min((int)sortedBooks.size(), 5); ++i) {
            if (sortedBooks[i].getIssueCount() > 0) {
                cout << left << setw(25) << (sortedBooks[i].getTitle().length() > 25 ? sortedBooks[i].getTitle().substr(0, 22) + "..." : sortedBooks[i].getTitle()) << " | " 
                     << setw(10) << sortedBooks[i].getIssueCount() << endl;
            }
        }
    }

    // Persistence
    void saveToFile() {
        ofstream bFile("books.txt");
        for (const auto& b : books) {
            bFile << b.getId() << "|" << b.getTitle() << "|" << b.getAuthor() << "|" 
                  << (int)b.getStatus() << "|" << b.getIssuedTo() << endl;
        }
        DisplayManager::showMessage("success", "Data saved to books.txt");
    }

    // Helpers
    Book* findBook(int id) {
        for (auto& b : books) if (b.getId() == id) return &b;
        return nullptr;
    }

    Student* findStudent(string reg) {
        for (auto& s : students) if (s.getRegNo() == reg) return &s;
        return nullptr;
    }

    const vector<Book>& getAllBooks() const { return books; }
};

// --- Menu System ---

class MenuSystem {
private:
    Library& library;
    string currentRole;
    string currentRegNo;

public:
    MenuSystem(Library& lib) : library(lib), currentRole("GUEST"), currentRegNo("") {}

    void start() {
        DisplayManager::clearScreen();
        DisplayManager::showLoading("Initializing System", 1);
        
        while (true) {
            DisplayManager::clearScreen();
            DisplayManager::showBanner();
            DisplayManager::showHeader("MAIN MENU");
            cout << "1. Admin Login" << endl;
            cout << "2. Student Login" << endl;
            cout << "3. Exit" << endl;
            cout << "\nChoice: ";
            int choice; cin >> choice;

            if (choice == 1) {
                DisplayManager::showLoading("Accessing Admin Portal");
                adminMenu();
            }
            else if (choice == 2) {
                DisplayManager::showLoading("Accessing Student Portal");
                studentMenu();
            }
            else if (choice == 3) {
                DisplayManager::showLoading("Shutting Down");
                break;
            }
        }
    }

    void adminMenu() {
        while (true) {
            DisplayManager::clearScreen();
            DisplayManager::showHeader("ADMIN DASHBOARD");
            cout << "1. Add Book" << endl;
            cout << "2. Issue Book (Wizard)" << endl;
            cout << "3. View All Books" << endl;
            cout << "4. Search" << endl;
            cout << "5. Reports" << endl;
            cout << "6. Save Data" << endl;
            cout << "7. Logout" << endl;
            cout << "\nChoice: ";
            int choice; cin >> choice;

            if (choice == 1) {
                int id; string t, a;
                cout << "ID: "; cin >> id;
                cout << "Title: "; cin.ignore(); getline(cin, t);
                cout << "Author: "; getline(cin, a);
                library.addBook(id, t, a);
                waitForEnter();
            } else if (choice == 2) {
                issueBookWizard();
            } else if (choice == 3) {
                DisplayManager::showBooks(library.getAllBooks());
                waitForEnter();
            } else if (choice == 4) {
                string q; cout << "Search: "; cin >> q;
                library.search(q);
                waitForEnter();
            } else if (choice == 5) {
                library.generateReports();
                waitForEnter();
            } else if (choice == 6) {
                library.saveToFile();
                waitForEnter();
            } else if (choice == 7) {
                cout << "Are you sure you want to logout? (y/n): ";
                char confirm; cin >> confirm;
                if (confirm == 'y' || confirm == 'Y') break;
            }
        }
    }

    void issueBookWizard() {
        DisplayManager::clearScreen();
        DisplayManager::showHeader("ISSUE BOOK WIZARD");
        
        cout << "Step 1: Enter Student RegNo: ";
        string reg; cin >> reg;
        Student* s = library.findStudent(reg);
        
        if (!s) {
            DisplayManager::showMessage("error", "Student not found!");
            waitForEnter();
            return;
        }

        int borrowed = s->getBorrowedBooks().size();
        cout << "\nStudent: " << s->getName() << " [" << reg << "]" << endl;
        cout << "Current Borrowed: " << borrowed << "/" << MAX_BORROW_LIMIT << endl;
        
        if (borrowed >= MAX_BORROW_LIMIT) {
            DisplayManager::showMessage("error", "Borrow limit reached. Cannot issue more books.");
            waitForEnter();
            return;
        }
        if (borrowed == MAX_BORROW_LIMIT - 1) {
            cout << "\033[1;33m[WARNING] This is the student's last allowed book!\033[0m" << endl;
        }

        DisplayManager::showBooks(library.getAllBooks());
        
        cout << "\nStep 2: Enter BookID to Issue: ";
        int bId; cin >> bId;
        Book* b = library.findBook(bId);

        if (!b) {
            DisplayManager::showMessage("error", "Book not found!");
            waitForEnter();
            return;
        }

        if (b->getStatus() == BookStatus::ISSUED) {
            DisplayManager::showMessage("error", "Book is already issued.");
            waitForEnter();
            return;
        }

        cout << "\nConfirm Issue: '" << b->getTitle() << "' to " << s->getName() << "? (y/n): ";
        char confirm; cin >> confirm;
        
        if (confirm == 'y' || confirm == 'Y') {
            library.issueBook(bId, reg);
        } else {
            cout << "Operation cancelled." << endl;
        }
        waitForEnter();
    }

    void studentMenu() {
        cout << "Enter RegNo: "; string reg; cin >> reg;
        if (!library.findStudent(reg)) {
            DisplayManager::showMessage("error", "Student not found.");
            waitForEnter();
            return;
        }
        currentRegNo = reg;

        while (true) {
            DisplayManager::clearScreen();
            DisplayManager::showHeader("STUDENT DASHBOARD (" + reg + ")");
            Student* s = library.findStudent(reg);
            if (s && s->getFine() > 0) {
                cout << "\033[1;31m[UNPAID FINE] $" << s->getFine() << "\033[0m" << endl;
            }
            cout << "1. Issue Book" << endl;
            cout << "2. Return Book" << endl;
            cout << "3. Search" << endl;
            cout << "4. Pay Fine" << endl;
            cout << "5. Logout" << endl;
            cout << "\nChoice: ";
            int choice; cin >> choice;

            if (choice == 1) {
                int id; cout << "Book ID: "; cin >> id;
                library.issueBook(id, currentRegNo);
                waitForEnter();
            } else if (choice == 2) {
                int id; cout << "Book ID: "; cin >> id;
                library.returnBook(id);
                waitForEnter();
            } else if (choice == 3) {
                string q; cout << "Search: "; cin >> q;
                library.search(q);
                waitForEnter();
            } else if (choice == 4) {
                library.payFine(currentRegNo);
                waitForEnter();
            } else if (choice == 5) {
                cout << "Are you sure you want to logout? (y/n): ";
                char confirm; cin >> confirm;
                if (confirm == 'y' || confirm == 'Y') break;
            }
        }
    }

    void waitForEnter() {
        cout << "\nPress Enter to continue...";
        cin.ignore();
        cin.get();
    }
};

int main() {
    Library lib;
    // Seed data: 10 Books
    lib.addBook(101, "Effective C++", "Scott Meyers");
    lib.addBook(102, "Clean Architecture", "Robert Martin");
    lib.addBook(103, "Design Patterns", "GoF");
    lib.addBook(104, "Pragmatic Programmer", "Hunt & Thomas");
    lib.addBook(105, "Refactoring", "Martin Fowler");
    lib.addBook(106, "Introduction to Algorithms", "CLRS");
    lib.addBook(107, "Code Complete", "Steve McConnell");
    lib.addBook(108, "The Mythical Man-Month", "Brooks");
    lib.addBook(109, "Structure and Interpretation", "Abelson");
    lib.addBook(110, "You Don't Know JS", "Kyle Simpson");

    // Seed data: 5 Students
    lib.addStudent("S001", "Alice (Limit)");
    lib.addStudent("S002", "Bob (Overdue)");
    lib.addStudent("S003", "Charlie (Fined)");
    lib.addStudent("S004", "David");
    lib.addStudent("S005", "Eve");

    // Scenario 1: Alice has 3 books (Limit)
    lib.issueBook(101, "S001");
    lib.issueBook(102, "S001");
    lib.issueBook(103, "S001");

    // Scenario 2: Charlie has a fine
    Student* charlie = lib.findStudent("S003");
    if (charlie) charlie->addFine(50.0);

    // Scenario 3: Random assignments and queues
    lib.issueBook(104, "S002"); // Bob has one book
    lib.issueBook(107, "S004"); // David has one book
    
    // Reservations (Queues)
    Book* b101 = lib.findBook(101);
    if (b101) b101->reserve("S003"); // Charlie in queue for 101
    
    Book* b104 = lib.findBook(104);
    if (b104) b104->reserve("S004"); // David in queue for 104

    Book* b105 = lib.findBook(105);
    if (b105) b105->reserve("S005"); // Eve in queue for 105 (available book)

    MenuSystem menu(lib);
    menu.start();

    return 0;
}
