# Getting Started with GamePlan

This is a setup guide for the GamePlan project.

## Project Structure (Simple!)

```
GamePlan/
├── index.html          # Homepage
├── browse.html         # Browse code examples
├── search.html         # Search for code
├── about.html          # About page
├── css/
│   └── styles.css      # All the styling
├── js/
│   └── script.js       # All the JavaScript
├── images/             # Put images here
└── database/           # For database stuff later
```

## How to Work on This Project

### Step 1: Get the Code
```bash
git clone https://github.com/WSU-4110/GamePlan.git
cd GamePlan
```

### Step 2: Open the Website
- Just open `index.html` in your web browser.

### Step 3: Make Changes
- **HTML files**: Change the content and structure
- **css/styles.css**: Change how things look
- **js/script.js**: Change how things work

### Step 4: Test Your Changes
- Save your files
- Refresh your browser
- See your changes!

## Team Roles - Who Does What?

### Frontend Team
- Work on HTML, CSS, and JavaScript
- Make the website look good and work well
- Files you'll work with: `*.html`, `css/styles.css`, `js/script.js`

### Backend Team (Later)
- Work on the database and server
- Files you'll work with: stuff in `database/` folder

## What Each File Does

### HTML Files
- `index.html` - The main homepage
- `browse.html` - Where users browse code examples
- `search.html` - Where users search for code
- `about.html` - Information about the project

### CSS File
- `css/styles.css` - Makes everything look nice
- Controls colors, fonts, layout, and animations

### JavaScript File
- `js/script.js` - Makes the website interactive
- Handles search, filtering, mobile menu, etc.

## Working with Git (Simple Version)

### Before You Start Working:
```bash
git pull origin main
```

### After You Make Changes:
```bash
git add .
git commit -m "Describe what you changed"
git push origin main
```

### If You Want to Be Safe:
1. Create a branch: `git checkout -b your-name-feature`
2. Make your changes
3. Push your branch: `git push origin your-name-feature`
4. Ask Quinn, or another project member to merge it.