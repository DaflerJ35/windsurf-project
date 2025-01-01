import { storage } from './firebase-config.js';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { 
    createContent, 
    getContent, 
    getAllPublicContent,
    addComment,
    getComments,
    trackUserAction
} from './firestore-operations.js';

export class ContentManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.currentFilter = 'all';
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Content grid infinite scroll
        window.addEventListener('scroll', this.handleScroll.bind(this));
        
        // Content filters
        document.querySelectorAll('.content-filter').forEach(filter => {
            filter.addEventListener('click', (e) => {
                this.currentFilter = e.target.dataset.filter;
                this.refreshContent();
            });
        });
    }

    async uploadContent(files, metadata) {
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const contentId = crypto.randomUUID();
                const storageRef = ref(storage, `content/${contentId}/${file.name}`);
                
                // Upload file to Storage
                await uploadBytes(storageRef, file);
                const downloadURL = await getDownloadURL(storageRef);

                // Create content metadata in Firestore
                const contentData = {
                    title: metadata.title,
                    description: metadata.description,
                    url: downloadURL,
                    type: file.type.split('/')[0], // 'image' or 'video'
                    fileName: file.name,
                    size: file.size,
                    isPublic: metadata.isPublic,
                    tags: metadata.tags,
                    category: metadata.category,
                    price: metadata.price || 0,
                    thumbnailUrl: metadata.thumbnailUrl || downloadURL
                };

                await createContent(contentData);
                await trackUserAction('content_upload', { contentId, type: file.type });

                return { id: contentId, ...contentData };
            });

            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Error uploading content:', error);
            throw error;
        }
    }

    async deleteContent(contentId) {
        try {
            // Delete from Storage
            const storageRef = ref(storage, `content/${contentId}`);
            await deleteObject(storageRef);

            // Delete from Firestore
            await deleteDoc(doc(db, 'contentSets', contentId));
            
            await trackUserAction('content_delete', { contentId });
            return true;
        } catch (error) {
            console.error('Error deleting content:', error);
            throw error;
        }
    }

    async loadMoreContent() {
        try {
            const content = await getAllPublicContent(this.itemsPerPage);
            this.currentPage++;
            return this.renderContentGrid(content);
        } catch (error) {
            console.error('Error loading content:', error);
            throw error;
        }
    }

    renderContentGrid(content) {
        const contentGrid = document.getElementById('contentGrid');
        if (!contentGrid) return;

        content.forEach(item => {
            const card = this.createContentCard(item);
            contentGrid.appendChild(card);
        });
    }

    createContentCard(item) {
        const card = document.createElement('div');
        card.className = 'content-card';
        card.innerHTML = `
            <div class="content-thumbnail">
                <img src="${item.thumbnailUrl}" alt="${item.title}">
                ${item.type === 'video' ? '<span class="video-indicator"><i class="fas fa-play"></i></span>' : ''}
            </div>
            <div class="content-info">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                ${item.price > 0 ? `<span class="price">$${item.price}</span>` : ''}
                <div class="content-tags">
                    ${item.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        `;

        // Add click event to open content viewer
        card.addEventListener('click', () => this.openContentViewer(item));
        return card;
    }

    async openContentViewer(item) {
        const viewer = document.createElement('div');
        viewer.className = 'content-viewer';
        viewer.innerHTML = `
            <div class="viewer-content">
                ${item.type === 'video' 
                    ? `<video src="${item.url}" controls></video>`
                    : `<img src="${item.url}" alt="${item.title}">`
                }
                <div class="content-details">
                    <h2>${item.title}</h2>
                    <p>${item.description}</p>
                    <div class="comments-section">
                        <h3>Comments</h3>
                        <div class="comments-container"></div>
                        <form class="comment-form">
                            <textarea placeholder="Add a comment..."></textarea>
                            <button type="submit">Post</button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(viewer);
        await this.loadComments(item.id, viewer);
    }

    async loadComments(contentId, viewer) {
        try {
            const comments = await getComments(contentId);
            const container = viewer.querySelector('.comments-container');
            
            comments.forEach(comment => {
                const commentEl = document.createElement('div');
                commentEl.className = 'comment';
                commentEl.innerHTML = `
                    <div class="comment-header">
                        <img src="${comment.userPhotoURL || '/images/default-avatar.png'}" alt="User">
                        <span>${comment.userName}</span>
                        <span class="comment-date">${new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p>${comment.text}</p>
                `;
                container.appendChild(commentEl);
            });
        } catch (error) {
            console.error('Error loading comments:', error);
        }
    }

    handleScroll() {
        if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 1000) {
            this.loadMoreContent();
        }
    }

    async refreshContent() {
        const contentGrid = document.getElementById('contentGrid');
        if (contentGrid) {
            contentGrid.innerHTML = '';
            this.currentPage = 1;
            await this.loadMoreContent();
        }
    }
}
