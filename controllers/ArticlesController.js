import Repository from '../models/repository.js';
import ArticleModel from '../models/Articles.js';
import Controller from './Controller.js';

export default
    class ArticleController extends Controller {
        constructor(HttpContext) {
            super(HttpContext, new Repository(new ArticleModel()));
        }
    }