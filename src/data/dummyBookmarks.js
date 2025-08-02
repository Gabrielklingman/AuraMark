// Static dummy data for bookmarks
const dummyBookmarks = [
  {
    id: 1,
    type: 'link',
    title: 'The Complete Guide to Modern Web Development',
    url: 'https://example.com/web-development-guide',
    notes: 'Comprehensive tutorial covering HTML, CSS, JavaScript, and modern frameworks. Great reference for beginners and intermediate developers.',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    tags: ['web-dev', 'tutorial', 'javascript'],
    isFavorite: true,
    isRead: false,
    dateAdded: '2023-05-15T10:30:00Z'
  },
  {
    id: 2,
    type: 'link',
    title: 'Machine Learning Basics: A Beginner\'s Guide',
    url: 'https://example.com/ml-basics',
    notes: 'Introduction to machine learning concepts and algorithms with Python examples.',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    tags: ['machine-learning', 'python', 'data-science'],
    isFavorite: false,
    isRead: true,
    dateAdded: '2023-04-20T15:45:00Z'
  },
  {
    id: 3,
    type: 'text',
    title: 'Project Ideas for Portfolio',
    notes: 'Build a personal finance tracker with React and Firebase. Create a recipe app with a recommendation system. Develop a productivity chrome extension for time management.',
    thumbnail: null,
    tags: ['ideas', 'projects'],
    isFavorite: true,
    isRead: false,
    dateAdded: '2023-06-01T09:15:00Z'
  },
  {
    id: 4,
    type: 'link',
    title: 'UI/UX Design Principles for Developers',
    url: 'https://example.com/design-for-devs',
    notes: 'Learn the fundamental principles of UI/UX design that every developer should know to create better user experiences.',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    tags: ['design', 'ui-ux'],
    isFavorite: false,
    isRead: false,
    dateAdded: '2023-05-28T14:20:00Z'
  },
  {
    id: 5,
    type: 'link',
    title: 'Advanced CSS Techniques and Animations',
    url: 'https://example.com/advanced-css',
    notes: 'Master complex CSS layouts, animations, and responsive design patterns for modern websites.',
    thumbnail: 'https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    tags: ['css', 'animation', 'web-dev'],
    isFavorite: true,
    isRead: true,
    dateAdded: '2023-03-12T11:10:00Z'
  },
  {
    id: 6,
    type: 'text',
    title: 'Meeting Notes: Product Planning',
    notes: 'Key points from product planning meeting: Launch timeline set for Q3. New features prioritized: social sharing, dark mode, and export functionality. Need to follow up with design team by Friday.',
    thumbnail: null,
    tags: ['work', 'meeting', 'product'],
    isFavorite: false,
    isRead: false,
    dateAdded: '2023-06-05T16:30:00Z'
  }
];

export default dummyBookmarks;