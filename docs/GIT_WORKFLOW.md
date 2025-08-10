# 🌊 Git Workflow Guide - Library Management System

## 📊 **Branch Strategy**

```
main (🚀 Production)
├── Railway auto-deploy
├── Stable, tested code only
└── Protected branch

develop (🔧 Development)  
├── Integration branch
├── Latest development features
└── Testing environment

feature/* (✨ Features)
├── feature/user-authentication
├── feature/advanced-search
├── feature/reporting-dashboard
└── Merge to develop when complete

bugfix/* (🐛 Bug Fixes)
├── bugfix/book-validation-error
├── bugfix/search-performance
└── Merge to develop when fixed

hotfix/* (🚨 Urgent Fixes)
├── hotfix/critical-security-patch
├── Branch from main
└── Merge to both main & develop
```

---

## 🛠️ **Development Workflow**

### **1. 🆕 Bắt đầu feature mới:**
```bash
# Switch to develop
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/ten-tinh-nang-moi

# Work on feature...
git add .
git commit -m "✨ Add new feature description"

# Push feature branch
git push -u origin feature/ten-tinh-nang-moi
```

### **2. 🐛 Fix bug:**
```bash
# Switch to develop
git checkout develop
git pull origin develop

# Create bugfix branch
git checkout -b bugfix/ten-loi-can-sua

# Fix bug...
git add .
git commit -m "🐛 Fix bug description"

# Push bugfix branch
git push -u origin bugfix/ten-loi-can-sua
```

### **3. 🚨 Hotfix khẩn cấp (production):**
```bash
# Switch to main
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/critical-fix

# Fix critical issue...
git add .
git commit -m "🚨 Hotfix: critical issue description"

# Push hotfix
git push -u origin hotfix/critical-fix

# Create PR to main (auto-deploy)
# Then merge back to develop
```

### **4. ✅ Merge feature/bugfix:**
```bash
# Switch to develop
git checkout develop
git pull origin develop

# Merge feature (or create PR)
git merge feature/ten-tinh-nang-moi

# Push to develop
git push origin develop

# Delete feature branch
git branch -d feature/ten-tinh-nang-moi
git push origin --delete feature/ten-tinh-nang-moi
```

### **5. 🚀 Deploy to production:**
```bash
# When develop is stable and tested
git checkout main
git pull origin main

# Merge develop to main
git merge develop

# Push to main (triggers Railway deploy)
git push origin main

# Tag release
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

---

## 📝 **Commit Message Convention**

### **Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### **Types:**
- ✨ `feat`: New feature
- 🐛 `fix`: Bug fix
- 📚 `docs`: Documentation
- 💎 `style`: Code style (formatting, etc)
- 🔨 `refactor`: Code refactoring
- ⚡ `perf`: Performance improvement
- ✅ `test`: Adding tests
- 🔧 `chore`: Build process, tools, etc
- 🚀 `deploy`: Deployment related

### **Examples:**
```bash
git commit -m "✨ feat(books): add bulk delete functionality"
git commit -m "🐛 fix(search): resolve pagination bug"
git commit -m "📚 docs: update API documentation"
git commit -m "🚀 deploy: update Railway configuration"
```

---

## 🎯 **Current Status**

- **main**: ✅ Production (Railway auto-deploy)
- **develop**: ✅ Ready for development
- **Active**: Ready to create feature branches

### **Next Steps:**
1. Create feature branch for new functionality
2. Create bugfix branch for any issues
3. Test on develop before merging to main

---

## 🚦 **Branch Protection Rules**

### **main branch:**
- ✅ Require pull request reviews
- ✅ Require status checks to pass
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

### **develop branch:**
- ✅ Require pull request reviews (optional)
- ✅ Allow force pushes for quick fixes

---

## 📈 **Workflow Benefits**

1. **🛡️ Safe Production**: main always stable
2. **🔄 Continuous Integration**: develop for testing
3. **🎯 Feature Isolation**: separate branches
4. **🚀 Quick Deployment**: main → Railway
5. **📊 Clear History**: organized commits
6. **👥 Team Collaboration**: PR reviews

**🎉 Ready to start development with professional Git workflow!**
