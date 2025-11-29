// Global variables
let currentMonthOffset = 0;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkUserName();
});

// Check if user name exists
function checkUserName() {
    const userName = localStorage.getItem('userName');
    if (userName) {
        document.getElementById('welcomeModal').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        initializeApp();
    } else {
        document.getElementById('welcomeModal').style.display = 'flex';
    }
}

// Start app with user name
function startApp() {
    const nameInput = document.getElementById('userName');
    const name = nameInput.value.trim();
    
    if (name === '') {
        nameInput.style.borderColor = 'var(--danger)';
        nameInput.placeholder = 'Please enter your name!';
        return;
    }
    
    localStorage.setItem('userName', name);
    document.getElementById('welcomeModal').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    initializeApp();
}

// Initialize main app
function initializeApp() {
    const userName = localStorage.getItem('userName');
    document.getElementById('userGreeting').textContent = `Hello, ${userName}! 👋`;
    updateDate();
    loadTodayMeals();
    updateStats();
    renderWeeklyCalendar();
    renderMonthlyCalendar();
}

// Update current date display
function updateDate() {
    const dateElement = document.getElementById('currentDate');
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-US', options);
}

// Get today's date key
function getTodayKey() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Get date key for any date
function getDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Load today's meals from localStorage
function loadTodayMeals() {
    const todayKey = getTodayKey();
    const meals = JSON.parse(localStorage.getItem(todayKey)) || { lunch: false, dinner: false };
    
    updateMealUI('lunch', meals.lunch);
    updateMealUI('dinner', meals.dinner);
}

// Toggle meal status
function toggleMeal(mealType) {
    const todayKey = getTodayKey();
    const meals = JSON.parse(localStorage.getItem(todayKey)) || { lunch: false, dinner: false };
    
    meals[mealType] = !meals[mealType];
    
    if (meals[mealType]) {
        meals[`${mealType}Time`] = new Date().toISOString();
    } else {
        delete meals[`${mealType}Time`];
    }
    
    localStorage.setItem(todayKey, JSON.stringify(meals));
    
    updateMealUI(mealType, meals[mealType]);
    updateStats();
    renderWeeklyCalendar();
    renderMonthlyCalendar();
    
    if (meals[mealType]) {
        celebrateMeal(mealType);
    }
}

// Update meal UI
function updateMealUI(mealType, isConsumed) {
    const card = document.getElementById(`${mealType}Card`);
    const button = document.getElementById(`${mealType}Button`);
    const status = document.getElementById(`${mealType}Status`);
    
    if (isConsumed) {
        card.classList.add('consumed');
        button.classList.add('checked');
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        status.textContent = `✓ Consumed at ${time}`;
    } else {
        card.classList.remove('consumed');
        button.classList.remove('checked');
        status.textContent = 'Not consumed yet';
    }
}

// Celebration animation
function celebrateMeal(mealType) {
    const card = document.getElementById(`${mealType}Card`);
    card.style.animation = 'none';
    setTimeout(() => {
        card.style.animation = 'celebrate 0.5s ease';
    }, 10);
}

// Update statistics
function updateStats() {
    const todayKey = getTodayKey();
    const meals = JSON.parse(localStorage.getItem(todayKey)) || { lunch: false, dinner: false };
    
    // Today's meals
    const consumed = (meals.lunch ? 1 : 0) + (meals.dinner ? 1 : 0);
    document.getElementById('todayMeals').textContent = `${consumed}/2`;
    
    // Weekly progress
    const weeklyData = getWeeklyData();
    const totalWeeklyMeals = weeklyData.length * 2;
    const consumedWeeklyMeals = weeklyData.reduce((sum, day) => {
        const dayMeals = JSON.parse(localStorage.getItem(day)) || { lunch: false, dinner: false };
        return sum + (dayMeals.lunch ? 1 : 0) + (dayMeals.dinner ? 1 : 0);
    }, 0);
    const weeklyProgress = Math.round((consumedWeeklyMeals / totalWeeklyMeals) * 100);
    document.getElementById('weeklyProgress').textContent = `${weeklyProgress}%`;
    
    // Monthly progress
    const monthlyData = getMonthlyData(currentMonthOffset);
    const totalMonthlyMeals = monthlyData.length * 2;
    const consumedMonthlyMeals = monthlyData.reduce((sum, day) => {
        const dayMeals = JSON.parse(localStorage.getItem(day)) || { lunch: false, dinner: false };
        return sum + (dayMeals.lunch ? 1 : 0) + (dayMeals.dinner ? 1 : 0);
    }, 0);
    const monthlyProgress = Math.round((consumedMonthlyMeals / totalMonthlyMeals) * 100);
    document.getElementById('monthlyProgress').textContent = `${monthlyProgress}%`;
    
    // Streak calculation
    const streak = calculateStreak();
    document.getElementById('streak').textContent = streak;
}

// Get weekly data (last 7 days)
function getWeeklyData() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(getDateKey(date));
    }
    return days;
}

// Get monthly data
function getMonthlyData(monthOffset = 0) {
    const days = [];
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        days.push(getDateKey(date));
    }
    return days;
}

// Calculate streak
function calculateStreak() {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 365; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const key = getDateKey(date);
        const meals = JSON.parse(localStorage.getItem(key));
        
        if (!meals || (!meals.lunch && !meals.dinner)) {
            break;
        }
        
        if (meals.lunch || meals.dinner) {
            streak++;
        }
    }
    
    return streak;
}

// Render weekly calendar
function renderWeeklyCalendar() {
    const calendar = document.getElementById('weeklyCalendar');
    calendar.innerHTML = '';
    
    const weeklyData = getWeeklyData();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    weeklyData.forEach(dateKey => {
        const [year, month, day] = dateKey.split('-');
        const date = new Date(year, month - 1, day);
        const meals = JSON.parse(localStorage.getItem(dateKey)) || { lunch: false, dinner: false };
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        dayCard.innerHTML = `
            <div class="day-name">${dayNames[date.getDay()]}</div>
            <div class="day-date">${day}</div>
            <div class="day-meals">
                <div class="meal-dot ${meals.lunch ? 'consumed' : ''}" title="Lunch"></div>
                <div class="meal-dot ${meals.dinner ? 'consumed' : ''}" title="Dinner"></div>
            </div>
        `;
        
        calendar.appendChild(dayCard);
    });
}

// Render monthly calendar
function renderMonthlyCalendar() {
    const calendar = document.getElementById('monthlyCalendar');
    calendar.innerHTML = '';
    
    const today = new Date();
    const targetDate = new Date(today.getFullYear(), today.getMonth() + currentMonthOffset, 1);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth();
    
    // Update month display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Get monthly data
    const monthlyData = getMonthlyData(currentMonthOffset);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    // Calculate stats
    let totalLunch = 0, totalDinner = 0;
    monthlyData.forEach(dateKey => {
        const meals = JSON.parse(localStorage.getItem(dateKey)) || { lunch: false, dinner: false };
        if (meals.lunch) totalLunch++;
        if (meals.dinner) totalDinner++;
    });
    
    document.getElementById('monthlyTotal').textContent = `${totalLunch + totalDinner}/${monthlyData.length * 2}`;
    document.getElementById('monthlyLunch').textContent = `${totalLunch}/${monthlyData.length}`;
    document.getElementById('monthlyDinner').textContent = `${totalDinner}/${monthlyData.length}`;
    
    // Add empty cells for days before month starts
    const firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'day-card';
        emptyCard.style.opacity = '0.3';
        calendar.appendChild(emptyCard);
    }
    
    // Add day cards
    monthlyData.forEach(dateKey => {
        const [y, m, day] = dateKey.split('-');
        const date = new Date(y, m - 1, day);
        const meals = JSON.parse(localStorage.getItem(dateKey)) || { lunch: false, dinner: false };
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        
        // Highlight today
        if (dateKey === getTodayKey()) {
            dayCard.style.borderColor = 'var(--primary)';
            dayCard.style.background = 'rgba(99, 102, 241, 0.1)';
        }
        
        dayCard.innerHTML = `
            <div class="day-name">${dayNames[date.getDay()]}</div>
            <div class="day-date">${day}</div>
            <div class="day-meals">
                <div class="meal-dot ${meals.lunch ? 'consumed' : ''}" title="Lunch"></div>
                <div class="meal-dot ${meals.dinner ? 'consumed' : ''}" title="Dinner"></div>
            </div>
        `;
        
        calendar.appendChild(dayCard);
    });
}

// Switch between tabs
function switchTab(tab) {
    const weeklySection = document.getElementById('weeklySection');
    const monthlySection = document.getElementById('monthlySection');
    const tabs = document.querySelectorAll('.tab-button');
    
    tabs.forEach(t => t.classList.remove('active'));
    
    if (tab === 'weekly') {
        weeklySection.style.display = 'block';
        monthlySection.style.display = 'none';
        tabs[0].classList.add('active');
    } else {
        weeklySection.style.display = 'none';
        monthlySection.style.display = 'block';
        tabs[1].classList.add('active');
    }
}

// Change month
function changeMonth(offset) {
    currentMonthOffset += offset;
    renderMonthlyCalendar();
    updateStats();
}

// Open settings
function openSettings() {
    const userName = localStorage.getItem('userName');
    document.getElementById('editUserName').value = userName;
    document.getElementById('settingsModal').style.display = 'flex';
}

// Close settings
function closeSettings() {
    document.getElementById('settingsModal').style.display = 'none';
}

// Update name
function updateName() {
    const nameInput = document.getElementById('editUserName');
    const name = nameInput.value.trim();
    
    if (name === '') {
        nameInput.style.borderColor = 'var(--danger)';
        return;
    }
    
    localStorage.setItem('userName', name);
    document.getElementById('userGreeting').textContent = `Hello, ${name}! 👋`;
    closeSettings();
}

// Export data
function exportData() {
    const userName = localStorage.getItem('userName');
    const allData = {};
    
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== 'userName') {
            allData[key] = JSON.parse(localStorage.getItem(key));
        }
    }
    
    const dataStr = JSON.stringify({ userName, meals: allData }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rotipani-data-${userName}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
}

// Clear history
function clearHistory() {
    if (confirm('Are you sure you want to clear all meal history? Your name will be preserved. This cannot be undone.')) {
        const userName = localStorage.getItem('userName');
        localStorage.clear();
        localStorage.setItem('userName', userName);
        loadTodayMeals();
        updateStats();
        renderWeeklyCalendar();
        renderMonthlyCalendar();
        alert('History cleared successfully!');
    }
}

// Allow Enter key to submit name
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const welcomeModal = document.getElementById('welcomeModal');
        const settingsModal = document.getElementById('settingsModal');
        
        if (welcomeModal.style.display === 'flex') {
            startApp();
        } else if (settingsModal.style.display === 'flex') {
            updateName();
        }
    }
});