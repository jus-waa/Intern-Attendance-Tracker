# Project Setup
### Install the following:
- Python
- PostgreSQL
- VSCode
- Postman
- DBeaver
  
### Clone and Run project
```
git clone <project-link>
```
cd <project-name>
cd server
\venv\Scripts\activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload

### Setup Database
Create a connection
Use PosgreSQL
Setup your own DB
Paste scripts from db.sql starting from /*LATEST*/

Note: for contributors do not commit on main

