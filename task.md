Assignment 
In this assignment, you are expected to implement a basic application with React.  
Please submit your projects, as much as you have done. 
Details 
Application starts with a classical Login / Register page where users can either login with username 
and password or register if they don’t have any account. 
After Login, There will be 3 pages, 
A homepage displays statical reports regarding tables, “There are X numbers of companies in the 
system”, “Lastly added companies:” (Lists 3 latest added companies), etc. any creative display 
panels. These panels are dynamically updated changes on their data. 
A table page for companies where companies are listed in a table. New companies can be added and 
existing companies can be edited or removed. Companies have following fields: - Company Name - 
Company Legal Number - Incorporation Country - Website 
A table page for products where products are listed in a table. New products can be added and 
existing products can be edited or removed. Products have following fields: - Product Name - Product 
Category - Product Amount - Amount Unit - Company (In relation with companies from Company 
table) 
You can use mock data to simulate database related operations such as listing companies & 
products. Checking users Login, and on each create update delete operations you can modify these 
mock data. We are expecting to see how you use features of React. 
Suggestion: In our development environment we are using Antd components. So you can use those 
components to create Tables. 
Bonuses 
• Any extra functionalities on tables (sorting, filtering, searching, pagination etc.) 
• A simple NodeJS - Express implementation to transfer all mock data to a server like structure 
and Application fetches all necessary data from that server. 
• For implementing CRUD operations for Companies and Products, while a static array is 
acceptable, setting up a relational database (preferably PostgreSQL with Sequelize ORM) or 
a NoSQL system (like MongoDB) will be highly evaluated. 
• Writing tests for the entire project is not expected. However, covering at least one critical 
business logic or service with a few unit tests (using tools like Jest, Mocha, etc.) is a great 
plus. 
• A simple README.md file that guides us on how to run and use your project. To keep it sweet 
and short, you can just include: 
1. 
Prerequisites & Installation steps (e.g., npm install, Env setup) 
2. How to run the application and tests (e.g., npm start, npm test) 
3. A brief explanation of your architectural choices (if any) 
• A Basic Login-Register process and token authentication with JWT 
• Using typescript 
• Any creative features 
1 