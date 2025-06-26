import HomePage from '../pages/home/home-page';
import LoginPage from '../pages/login/login-page';
import RegisterPage from '../pages/register/register-page';
import AddPage from '../pages/add/add-page';
import StoryDetailPage from '../pages/story/story-detail-page';
import MapPage from '../pages/mapPage';
import SavedStoriesPage from '../pages/saved/saved-page.js';
import NotFoundPage from '../pages/not-found-page';

// Hapus import AboutPage jika ingin dynamic import

const routes = {
  '/': LoginPage,
  '/login': LoginPage,
  '/home': () => import('../pages/home/home-page'),
  '/about': () => import('../pages/about/about-page'),
  '/tambah': () => import('../pages/add/add-page'),
  '/register': () => import('../pages/register/register-page'),
  '/story/:id': () => import('../pages/story/story-detail-page'),
  '/map': () => import('../pages/mapPage'),
  '/saved': () => import('../pages/saved/saved-page.js'),
  '/404': NotFoundPage,
};

export default routes;
