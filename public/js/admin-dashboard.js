import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import Chart from 'chart.js/auto';

class AdminDashboard {
    constructor() {
        this.db = getFirestore();
        this.auth = getAuth();
        this.currentView = 'overview';
        this.charts = {};
        
        this.initializeAuth();
        this.initializeEventListeners();
        this.loadDashboardData();
    }

    initializeAuth() {
        onAuthStateChanged(this.auth, (user) => {
            if (user) {
                this.currentUser = user;
                this.checkAdminStatus();
            } else {
                window.location.href = '/login.html';
            }
        });
    }

    async checkAdminStatus() {
        const userDoc = await getDocs(query(
            collection(this.db, 'users'),
            where('uid', '==', this.currentUser.uid),
            where('role', '==', 'admin')
        ));

        if (userDoc.empty) {
            window.location.href = '/';
        }
    }

    initializeEventListeners() {
        // Navigation
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.addEventListener('click', () => {
                const view = item.dataset.view;
                this.switchView(view);
            });
        });

        // Content Filters
        document.querySelectorAll('.content-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterContent(filter);
            });
        });

        // User Filters
        document.querySelectorAll('.user-filters .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.dataset.filter;
                this.filterUsers(filter);
            });
        });

        // Search
        const searchInput = document.querySelector('.header-search input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Settings Forms
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSettingsSubmit(e.target);
            });
        });
    }

    async loadDashboardData() {
        await Promise.all([
            this.loadStats(),
            this.loadCharts(),
            this.loadContent(),
            this.loadUsers()
        ]);
    }

    async loadStats() {
        try {
            // Load total users
            const usersSnapshot = await getDocs(collection(this.db, 'users'));
            const totalUsers = usersSnapshot.size;

            // Load premium users
            const premiumSnapshot = await getDocs(query(
                collection(this.db, 'users'),
                where('subscription.status', '==', 'active')
            ));
            const premiumUsers = premiumSnapshot.size;

            // Load total content
            const contentSnapshot = await getDocs(collection(this.db, 'content'));
            const totalContent = contentSnapshot.size;

            // Calculate revenue (last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            const revenueSnapshot = await getDocs(query(
                collection(this.db, 'payments'),
                where('timestamp', '>=', thirtyDaysAgo),
                orderBy('timestamp', 'desc')
            ));

            const revenue = revenueSnapshot.docs.reduce((acc, doc) => acc + doc.data().amount, 0);

            // Update stats in UI
            this.updateStatsUI({
                totalUsers,
                premiumUsers,
                totalContent,
                revenue
            });
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    updateStatsUI(stats) {
        const statsGrid = document.getElementById('dashboardStats');
        if (!statsGrid) return;

        statsGrid.innerHTML = `
            <div class="stat-card" data-aos="fade-up">
                <div class="stat-icon">
                    <i class="fas fa-users"></i>
                </div>
                <div class="stat-content">
                    <h3>Total Users</h3>
                    <p class="stat-number">${stats.totalUsers}</p>
                    <div class="stat-details">
                        <span>${stats.premiumUsers} Premium</span>
                        <span>${stats.totalUsers - stats.premiumUsers} Free</span>
                    </div>
                </div>
            </div>
            <div class="stat-card" data-aos="fade-up" data-aos-delay="100">
                <div class="stat-icon">
                    <i class="fas fa-photo-video"></i>
                </div>
                <div class="stat-content">
                    <h3>Total Content</h3>
                    <p class="stat-number">${stats.totalContent}</p>
                </div>
            </div>
            <div class="stat-card" data-aos="fade-up" data-aos-delay="200">
                <div class="stat-icon">
                    <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="stat-content">
                    <h3>Monthly Revenue</h3>
                    <p class="stat-number">$${(stats.revenue / 100).toFixed(2)}</p>
                    <div class="stat-details">Last 30 days</div>
                </div>
            </div>
        `;
    }

    async loadCharts() {
        await Promise.all([
            this.initRevenueChart(),
            this.initUserGrowthChart(),
            this.initTrafficSourcesChart(),
            this.initContentPerformanceChart()
        ]);
    }

    async initRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const revenueData = await getDocs(query(
            collection(this.db, 'payments'),
            where('timestamp', '>=', thirtyDaysAgo),
            orderBy('timestamp', 'desc')
        ));

        const dailyRevenue = {};
        revenueData.forEach(doc => {
            const date = doc.data().timestamp.toDate().toLocaleDateString();
            dailyRevenue[date] = (dailyRevenue[date] || 0) + doc.data().amount;
        });

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(dailyRevenue),
                datasets: [{
                    label: 'Daily Revenue',
                    data: Object.values(dailyRevenue).map(amount => amount / 100),
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }

    async initUserGrowthChart() {
        const ctx = document.getElementById('userGrowthChart');
        if (!ctx) return;

        const usersSnapshot = await getDocs(query(
            collection(this.db, 'users'),
            orderBy('createdAt', 'desc')
        ));

        const monthlyUsers = {};
        usersSnapshot.forEach(doc => {
            const date = doc.data().createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            monthlyUsers[date] = (monthlyUsers[date] || 0) + 1;
        });

        this.charts.userGrowth = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(monthlyUsers),
                datasets: [{
                    label: 'New Users',
                    data: Object.values(monthlyUsers),
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    async loadContent(filter = 'all') {
        const contentList = document.getElementById('contentList');
        if (!contentList) return;

        try {
            let contentQuery = collection(this.db, 'content');
            
            if (filter !== 'all') {
                contentQuery = query(contentQuery, where('status', '==', filter));
            }

            const contentSnapshot = await getDocs(contentQuery);
            const contentHTML = contentSnapshot.docs.map(doc => {
                const content = doc.data();
                return `
                    <div class="content-list-item" data-aos="fade-up">
                        <div class="content-preview">
                            <img src="${content.thumbnail || 'assets/placeholder.jpg'}" alt="${content.title}">
                        </div>
                        <div class="content-details">
                            <h3>${content.title}</h3>
                            <p>${content.description}</p>
                            <div class="content-meta">
                                <span><i class="fas fa-user"></i> ${content.author}</span>
                                <span><i class="fas fa-calendar"></i> ${content.createdAt.toDate().toLocaleDateString()}</span>
                                <span><i class="fas fa-eye"></i> ${content.views || 0} views</span>
                            </div>
                        </div>
                        <div class="content-actions">
                            <button class="btn btn-primary" onclick="handleContentAction('approve', '${doc.id}')">
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-danger" onclick="handleContentAction('reject', '${doc.id}')">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            contentList.innerHTML = contentHTML;
        } catch (error) {
            console.error('Error loading content:', error);
        }
    }

    async loadUsers(filter = 'all') {
        const userList = document.getElementById('userList');
        if (!userList) return;

        try {
            let usersQuery = collection(this.db, 'users');
            
            if (filter === 'premium') {
                usersQuery = query(usersQuery, where('subscription.status', '==', 'active'));
            } else if (filter === 'banned') {
                usersQuery = query(usersQuery, where('status', '==', 'banned'));
            }

            const usersSnapshot = await getDocs(usersQuery);
            const usersHTML = usersSnapshot.docs.map(doc => {
                const user = doc.data();
                return `
                    <div class="user-list-item" data-aos="fade-up">
                        <div class="user-avatar">
                            <img src="${user.photoURL || 'assets/default-avatar.jpg'}" alt="${user.displayName}">
                        </div>
                        <div class="user-details">
                            <h3>${user.displayName}</h3>
                            <p>${user.email}</p>
                            <div class="user-meta">
                                <span><i class="fas fa-calendar"></i> Joined ${user.createdAt.toDate().toLocaleDateString()}</span>
                                <span><i class="fas fa-crown"></i> ${user.subscription?.status === 'active' ? 'Premium' : 'Free'}</span>
                            </div>
                        </div>
                        <div class="user-actions">
                            <button class="btn ${user.status === 'banned' ? 'btn-success' : 'btn-danger'}"
                                    onclick="handleUserAction('${user.status === 'banned' ? 'unban' : 'ban'}', '${doc.id}')">
                                <i class="fas fa-${user.status === 'banned' ? 'user-check' : 'user-slash'}"></i>
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            userList.innerHTML = usersHTML;
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    switchView(view) {
        // Hide all views
        document.querySelectorAll('.admin-view').forEach(v => v.classList.remove('active'));
        
        // Show selected view
        const selectedView = document.getElementById(`${view}View`);
        if (selectedView) {
            selectedView.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.admin-nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.view === view);
        });

        // Load view-specific data
        this.currentView = view;
        switch (view) {
            case 'overview':
                this.loadStats();
                this.loadCharts();
                break;
            case 'content':
                this.loadContent();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'analytics':
                this.loadAnalytics();
                break;
        }
    }

    filterContent(filter) {
        document.querySelectorAll('.content-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.loadContent(filter);
    }

    filterUsers(filter) {
        document.querySelectorAll('.user-filters .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.loadUsers(filter);
    }

    async handleContentAction(action, contentId) {
        try {
            const contentRef = doc(this.db, 'content', contentId);
            
            if (action === 'approve') {
                await updateDoc(contentRef, {
                    status: 'approved',
                    approvedAt: new Date(),
                    approvedBy: this.currentUser.uid
                });
            } else if (action === 'reject') {
                await updateDoc(contentRef, {
                    status: 'rejected',
                    rejectedAt: new Date(),
                    rejectedBy: this.currentUser.uid
                });
            }

            // Reload content list
            this.loadContent();
        } catch (error) {
            console.error('Error handling content action:', error);
        }
    }

    async handleUserAction(action, userId) {
        try {
            const userRef = doc(this.db, 'users', userId);
            
            if (action === 'ban') {
                await updateDoc(userRef, {
                    status: 'banned',
                    bannedAt: new Date(),
                    bannedBy: this.currentUser.uid
                });
            } else if (action === 'unban') {
                await updateDoc(userRef, {
                    status: 'active',
                    unbannedAt: new Date(),
                    unbannedBy: this.currentUser.uid
                });
            }

            // Reload user list
            this.loadUsers();
        } catch (error) {
            console.error('Error handling user action:', error);
        }
    }

    handleSearch(query) {
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        this.searchTimeout = setTimeout(() => {
            switch (this.currentView) {
                case 'content':
                    this.searchContent(query);
                    break;
                case 'users':
                    this.searchUsers(query);
                    break;
            }
        }, 300);
    }

    async searchContent(query) {
        // Implement content search logic
        // This would typically involve querying Firestore with filters
        console.log('Searching content:', query);
    }

    async searchUsers(query) {
        // Implement user search logic
        // This would typically involve querying Firestore with filters
        console.log('Searching users:', query);
    }

    async handleSettingsSubmit(form) {
        const formData = new FormData(form);
        const settings = {};
        
        for (let [key, value] of formData.entries()) {
            settings[key] = value;
        }

        try {
            // Update settings in Firestore
            const settingsRef = doc(this.db, 'settings', 'general');
            await updateDoc(settingsRef, settings);
            
            // Show success message
            alert('Settings updated successfully');
        } catch (error) {
            console.error('Error updating settings:', error);
            alert('Error updating settings');
        }
    }

    async loadAnalytics() {
        // Initialize analytics charts
        this.initTrafficSourcesChart();
        this.initContentPerformanceChart();
        this.initEngagementChart();
        this.initConversionChart();
    }

    async initTrafficSourcesChart() {
        const ctx = document.getElementById('trafficSourcesChart');
        if (!ctx) return;

        // Sample data - replace with actual analytics data
        this.charts.trafficSources = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Direct', 'Social', 'Search', 'Referral'],
                datasets: [{
                    data: [30, 25, 35, 10],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.2)',
                        'rgba(54, 162, 235, 0.2)',
                        'rgba(153, 102, 255, 0.2)',
                        'rgba(255, 159, 64, 0.2)'
                    ],
                    borderColor: [
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)',
                        'rgb(255, 159, 64)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    async initContentPerformanceChart() {
        const ctx = document.getElementById('contentPerformanceChart');
        if (!ctx) return;

        const contentSnapshot = await getDocs(query(
            collection(this.db, 'content'),
            orderBy('views', 'desc'),
            limit(5)
        ));

        const labels = [];
        const views = [];
        contentSnapshot.forEach(doc => {
            const content = doc.data();
            labels.push(content.title);
            views.push(content.views || 0);
        });

        this.charts.contentPerformance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Views',
                    data: views,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y'
            }
        });
    }

    async initEngagementChart() {
        const ctx = document.getElementById('engagementChart');
        if (!ctx) return;

        // Sample data - replace with actual engagement metrics
        this.charts.engagement = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Active Users',
                    data: [120, 150, 180, 190, 160, 140, 130],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    async initConversionChart() {
        const ctx = document.getElementById('conversionChart');
        if (!ctx) return;

        // Sample data - replace with actual conversion metrics
        this.charts.conversion = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                datasets: [{
                    label: 'Conversion Rate',
                    data: [2.5, 3.2, 3.8, 4.1],
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        ticks: {
                            callback: value => value + '%'
                        }
                    }
                }
            }
        });
    }
}

export default AdminDashboard;
