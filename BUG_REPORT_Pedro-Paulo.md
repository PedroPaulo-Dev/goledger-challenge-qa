📑 Test Cycle Report & Technical Investigation
Candidate: Pedro Paulo
Date: April 06, 2026

🛠️ 1. Environment Documentation (Setup & Context)
The environment was configured using a hybrid architecture for fault isolation:
Backend (API & Ledger): Go API exposed on port 8080, running inside Docker Desktop containers via WSL 2 (Ubuntu 22.04).
Blockchain Engine: Hyperledger Fabric.
Frontend (Web): Executed natively on Windows Host via Node.js v20.12.1 (LTS).
Tooling: VS Code (Remote-WSL extension), Swagger UI for API contract validation, and Browser DevTools (Network/Application tabs) for request inspection.

🎯 2. Test Strategy
Smoke Testing: Happy Path validation (Login -> Dashboard).
API Testing: Endpoint validation via Swagger to isolate integration failures.
Cross-Module Testing: Verification of interdependencies between modules (Books, Libraries, Persons).

🐞 3. Bug Report
Field
Description
ID
BUG-001
Title
Session Token persistence in Local Storage after Logout
Component
Web
Endpoint / Page
Login Page / Local Storage
Severity
Critical
Description
Authentication token is not removed from the browser upon logout, allowing unauthorized access via page refresh.
Steps to Reproduce
1. Log in successfully; 2. Click "Logout"; 3. On the login page, press F5 or refresh the page.
Expected Behaviour
Local Storage should be cleared, and the user must remain on the login page after refresh.
Actual Behaviour
The system retrieves the token from Local Storage and redirects the user to the logged-in Dashboard.
Proposed Fix
Implement localStorage.removeItem('token') or localStorage.clear() in the Frontend logout method.


Field
Description
ID
BUG-002
Title
Missing Authorization Header on Book Creation (401 Unauthorized)
Component
API / Web
Endpoint / Page
POST /books
Severity
Critical
Description
Frontend fails to inject the JWT Token into the Authorization header, blocking transactions with the Blockchain.
Steps to Reproduce
1. Log in; 2. Attempt to create a new book; 3. Observe 401 error in the Network tab.
Expected Behaviour
Request must contain the header Authorization: Bearer <token>.
Actual Behaviour
API returns 401 Unauthorized with the message "authorization header required".
Proposed Fix
Inject the JWT Token retrieved during login into the headers of all "Invoke" (write) requests.


Field
Description
ID
BUG-003
Title
Resource Not Found (404) when assigning tenant to non-existent book
Component
Web / API
Endpoint / Page
/books/tenant
Severity
High
Description
The system attempts to perform an operation on an asset that does not exist in the Ledger, resulting in a 404 error.
Steps to Reproduce
1. Access the "Assign Tenant" section; 2. Manually fill in book and tenant data; 3. Confirm association.
Expected Behaviour
The system should not allow association if the book was not created or does not exist in the blockchain state.
Actual Behaviour
Request is sent and returns 404 Not Found (asset not found).
Proposed Fix
Implement Frontend validation or a dropdown list containing only existing assets from the Ledger.



Field
Description
ID
BUG-004
Title
Generic error message "An error occurred" for all API failures
Component
Web
Severity
Low
Description
Error messages do not inform the user about the actual root cause (Auth, Network, or Input).
Proposed Fix
Create an error mapper to handle HTTP status codes (401, 400, 500) and display specific feedback.



Field
Description
ID
BUG-005
Title
Missing 'name' argument on Library creation API
Component
API / Web
Endpoint / Page
/libraries
Severity
High
Description
API returns a missing argument error when creating a library, indicating a mismatch between the field name sent by the Front and expected by the Back.
Actual Behaviour
Response: {"error":"unable to get args: missing argument 'name'","status":400}.


Field
Description
ID
BUG-006
Title
Uncaught TypeError: Cannot read properties of null (reading 'error')
Component
Web (Frontend)
Endpoint / Page
/persons
Severity
High
Description
Logic failure in Frontend response handling causing a silent crash before the request is processed.
Actual Behaviour
System freezes and displays a null reference error in the browser console.


Field
Description
ID
BUG-007
Title
Unformatted JSON error response in Libraries and Query sections
Component
Web
Severity
Low
Description
System displays raw JSON errors directly to the end user without visual formatting.
Actual Behaviour
User sees technical code: {"error": "...", "status": 400}.





🔍 4. Technical Investigation (The Differential)
A. The "Empty State" Issue (Search & Books)
During testing, the Search functionality was validated as technically operational (HTTP 200 OK). However, since BUG-002 prevents the creation of new books, the search function becomes ineffective in practice, as there is no data to be retrieved from the Ledger.
B. Service Layer Contract Breach
"It was validated that login is successful (Token generated), but there is a contract breach in the service layer: the token is not passed to the API's protected routes. This blocks the core 'Create Asset' functionality and, consequently, renders the 'Assign Tenant' function inoperable (resulting in 404 errors due to missing data)."

🚀 5. QA Conclusion
The test environment proved that the Backend (Ledger) is responsive, but the application suffers from critical integration and security flaws in the Frontend. The inability to create assets (Books/Libraries) blocks the entire business flow of the challenge.
Recommendation: Prioritize fixing header injection (BUG-002) to enable regression testing across all other modules.


